"use server";
import type { InferSelectModel } from "drizzle-orm";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "~/auth";
import { db } from "~/db/connect";
import { sessions, users } from "~/db/schema/auth-schema";
import dbConnect from "~/lib/dbConnect";
import { flushAllRedisKeys } from "~/lib/redis";
import CommunityPostModel from "~/models/community";
import { EventModel } from "~/models/events";
import PollModel from "~/models/poll";
import ResultModel from "~/models/result";
import {
  calculateGrowthPercentage,
  calculateTrend,
  type DateRange,
  type GraphDataPoint,
  generateGraphData,
  getDateRanges,
  getPeriodLabel,
  type PeriodSummary,
  type TimeInterval,
} from "~/utils/process";
import { updateHostelStudent } from "./hostel.core";

// Mirrors app/[moderator]/(admin)/layout.tsx, which lets both roles in.
const ADMIN_ROLES = ["admin", "moderator"];
const SELF_EDITABLE_FIELDS = ["gender", "other_emails"] as const;

const getCurrentSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);

async function isServerIdentity() {
  // biome-ignore lint/suspicious/noUndeclaredEnvVars: runtime secret, not a build input
  const expected = process.env.SERVER_IDENTITY;
  if (!expected) return false;
  return (await headers()).get("x-authorization") === expected;
}

async function assertAdmin(options: { allowServerIdentity?: boolean } = {}) {
  if (options.allowServerIdentity && (await isServerIdentity())) return;
  const session = await getCurrentSession();
  if (!session || !ADMIN_ROLES.includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

export interface UserCountAndGrowthResult {
  currentPeriodCount: number;
  totalUsers: number;
  growth: number;
  growthPercent: number;
  trend: -1 | 1 | 0;
  periodStart: Date;
  periodEnd: Date;
  previousPeriodCount: number;
  graphData: GraphDataPoint[];
  summary: {
    currentPeriod: PeriodSummary;
    previousPeriod: PeriodSummary;
  };
}

function truncateBy(timeInterval: TimeInterval) {
  switch (timeInterval) {
    case "last_hour":
      return sql.raw("'minute'");
    case "last_24_hours":
      return sql.raw("'hour'");
    case "last_year":
      return sql.raw("'month'");
    default:
      return sql.raw("'day'");
  }
}

type CreatedAtColumn = typeof users.createdAt | typeof sessions.createdAt;
type CountedTable = typeof users | typeof sessions;

/** One grouped query over both periods, split in memory (was two round trips). */
async function fetchTimeSeries(
  table: CountedTable,
  column: CreatedAtColumn,
  timeInterval: TimeInterval,
  current: DateRange,
  previous: DateRange
) {
  const bucket = sql`DATE_TRUNC(${truncateBy(timeInterval)}, ${column})`;
  const rows = await db
    .select({
      timestamp: sql<Date>`${bucket}`.as("timestamp"),
      count: sql<number>`COUNT(*)::int`.as("count"),
    })
    .from(table)
    .where(sql`${column} >= ${previous.start} AND ${column} <= ${current.end}`)
    .groupBy(bucket)
    .orderBy(bucket);

  const currentData: { timestamp: Date; count: number }[] = [];
  const previousData: { timestamp: Date; count: number }[] = [];
  for (const row of rows) {
    const point = { timestamp: new Date(row.timestamp), count: row.count };
    (point.timestamp >= current.start ? currentData : previousData).push(point);
  }
  return { currentData, previousData };
}

function periodSummary(
  timeInterval: TimeInterval,
  current: DateRange,
  previous: DateRange,
  currentCount: number,
  previousCount: number
) {
  return {
    currentPeriod: {
      start: current.start,
      end: current.end,
      count: currentCount,
      label: getPeriodLabel(timeInterval, "current"),
    },
    previousPeriod: {
      start: previous.start,
      end: previous.end,
      count: previousCount,
      label: getPeriodLabel(timeInterval, "previous"),
    },
  };
}

const computeUserGrowth = cache(
  async (timeInterval: TimeInterval): Promise<UserCountAndGrowthResult> => {
    const { current, previous } = getDateRanges(timeInterval, new Date());
    const col = users.createdAt;
    const [counts, timeSeries] = await Promise.all([
      db
        .select({
          total: sql<number>`COUNT(*)::int`,
          current: sql<number>`(COUNT(*) FILTER (WHERE ${col} >= ${current.start} AND ${col} <= ${current.end}))::int`,
          previous: sql<number>`(COUNT(*) FILTER (WHERE ${col} >= ${previous.start} AND ${col} < ${current.start}))::int`,
        })
        .from(users),
      fetchTimeSeries(users, col, timeInterval, current, previous),
    ]);

    const totalUsers = counts[0]?.total ?? 0;
    const currentPeriodCount = counts[0]?.current ?? 0;
    const previousPeriodCount = counts[0]?.previous ?? 0;
    const growth = currentPeriodCount - previousPeriodCount;

    return {
      currentPeriodCount,
      totalUsers,
      growth,
      growthPercent: calculateGrowthPercentage(
        currentPeriodCount,
        previousPeriodCount
      ),
      trend: calculateTrend(growth),
      periodStart: current.start,
      periodEnd: current.end,
      previousPeriodCount,
      graphData: generateGraphData(timeSeries, timeInterval),
      summary: periodSummary(
        timeInterval,
        current,
        previous,
        currentPeriodCount,
        previousPeriodCount
      ),
    };
  }
);

/** User count and growth for a period. Admins, or the server identity header (/api/stats). */
export async function users_CountAndGrowth(
  timeInterval: TimeInterval
): Promise<UserCountAndGrowthResult> {
  await assertAdmin({ allowServerIdentity: true });
  try {
    return await computeUserGrowth(timeInterval);
  } catch (error) {
    throw new Error(
      `Failed to calculate user count and growth: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export interface SessionCountAndGrowthResult {
  currentPeriodCount: number;
  totalSessions: number;
  activeSessions: number;
  /** Distinct users holding an unexpired session. */
  activeUsers: number;
  growth: number;
  growthPercent: number;
  trend: -1 | 1 | 0;
  periodStart: Date;
  periodEnd: Date;
  previousPeriodCount: number;
  graphData: GraphDataPoint[];
  summary: {
    currentPeriod: PeriodSummary;
    previousPeriod: PeriodSummary;
  };
  uniqueUsers: number;
  avgSessionsPerUser: number;
}

const computeSessionGrowth = cache(
  async (timeInterval: TimeInterval): Promise<SessionCountAndGrowthResult> => {
    const now = new Date();
    const { current, previous } = getDateRanges(timeInterval, now);
    const col = sessions.createdAt;
    const inCurrent = sql`${col} >= ${current.start} AND ${col} <= ${current.end}`;
    const [counts, timeSeries] = await Promise.all([
      db
        .select({
          total: sql<number>`COUNT(*)::int`,
          active: sql<number>`(COUNT(*) FILTER (WHERE ${sessions.expiresAt} >= ${now}))::int`,
          activeUsers: sql<number>`(COUNT(DISTINCT ${sessions.userId}) FILTER (WHERE ${sessions.expiresAt} >= ${now}))::int`,
          current: sql<number>`(COUNT(*) FILTER (WHERE ${inCurrent}))::int`,
          previous: sql<number>`(COUNT(*) FILTER (WHERE ${col} >= ${previous.start} AND ${col} < ${current.start}))::int`,
          uniqueUsers: sql<number>`(COUNT(DISTINCT ${sessions.userId}) FILTER (WHERE ${inCurrent}))::int`,
        })
        .from(sessions),
      fetchTimeSeries(sessions, col, timeInterval, current, previous),
    ]);

    const row = counts[0];
    const currentPeriodCount = row?.current ?? 0;
    const previousPeriodCount = row?.previous ?? 0;
    const uniqueUsers = row?.uniqueUsers ?? 0;
    const growth = currentPeriodCount - previousPeriodCount;

    return {
      currentPeriodCount,
      totalSessions: row?.total ?? 0,
      activeSessions: row?.active ?? 0,
      activeUsers: row?.activeUsers ?? 0,
      growth,
      growthPercent: calculateGrowthPercentage(
        currentPeriodCount,
        previousPeriodCount
      ),
      trend: calculateTrend(growth),
      periodStart: current.start,
      periodEnd: current.end,
      previousPeriodCount,
      graphData: generateGraphData(timeSeries, timeInterval),
      summary: periodSummary(
        timeInterval,
        current,
        previous,
        currentPeriodCount,
        previousPeriodCount
      ),
      uniqueUsers,
      avgSessionsPerUser:
        uniqueUsers > 0
          ? Number((currentPeriodCount / uniqueUsers).toFixed(2))
          : 0,
    };
  }
);

/** Session count and growth for a period. Admins, or the server identity header (/api/stats). */
export async function sessions_CountAndGrowth(
  timeInterval: TimeInterval
): Promise<SessionCountAndGrowthResult> {
  await assertAdmin({ allowServerIdentity: true });
  try {
    return await computeSessionGrowth(timeInterval);
  } catch (error) {
    throw new Error(
      `Failed to calculate session count and growth: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

interface PlatformDBStats {
  results: number;
  polls: number;
  communityPosts: number;
  events: number;
}

export async function getPlatformDBStats(): Promise<PlatformDBStats> {
  await assertAdmin();
  try {
    await dbConnect();
    // estimatedDocumentCount reads collection metadata instead of scanning.
    const [results, polls, communityPosts, events] = await Promise.all([
      ResultModel.estimatedDocumentCount(),
      PollModel.estimatedDocumentCount(),
      CommunityPostModel.estimatedDocumentCount(),
      EventModel.estimatedDocumentCount(),
    ]);
    return { results, polls, communityPosts, events };
  } catch (error) {
    console.error("Error counting platform collections:", error);
    return { results: 0, polls: 0, communityPosts: 0, events: 0 };
  }
}

export async function flushCache(): Promise<boolean> {
  await assertAdmin();
  return flushAllRedisKeys();
}

type User = InferSelectModel<typeof users>;

export async function getUser(userId: string): Promise<User | null> {
  await assertAdmin();
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .execute();

  return user.length > 0 ? user[0] : null;
}

/** Admins may edit any field; everyone else only their own gender (once) and extra emails. */
export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<User | null> {
  try {
    const session = await getCurrentSession();
    if (!session) throw new Error("Unauthorized");
    const isAdmin = ADMIN_ROLES.includes(session.user.role);
    if (!isAdmin && session.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    let patch: Partial<User> = data;
    if (!isAdmin) {
      patch = {};
      for (const field of SELF_EDITABLE_FIELDS) {
        if (field in data) Object.assign(patch, { [field]: data[field] });
      }
      if (session.user.gender !== "not_specified") delete patch.gender;
      if (Object.keys(patch).length === 0) throw new Error("Nothing to update");
    }

    await db.update(users).set(patch).where(eq(users.id, userId)).execute();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (isAdmin && patch.hostelId && user) {
      await updateHostelStudent(user.email, { hostelId: patch.hostelId });
    }
    return user ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function changeUserPassword(
  userId: string,
  newPassword: string
): Promise<boolean> {
  try {
    const session = await getCurrentSession();
    if (
      !session ||
      session.user.id !== userId ||
      session.user.role !== "admin"
    ) {
      throw new Error("Unauthorized: You can only change your own password.");
    }
    const ctx = await auth.$context;
    const hash = await ctx.password.hash(newPassword);
    await ctx.internalAdapter.updatePassword(userId, hash);
    return true;
  } catch (error) {
    console.error("Error changing user password:", error);
    return false;
  }
}

export type AdminSessionRow = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
  impersonated: boolean;
};

/** A user's sessions without their tokens. better-auth's admin middleware gates the call. */
export async function getUserSessions(
  userId: string
): Promise<AdminSessionRow[]> {
  const { sessions: rows } = await auth.api.listUserSessions({
    headers: await headers(),
    body: { userId },
  });
  return rows.map((row) => ({
    id: row.id,
    userAgent: row.userAgent ?? null,
    ipAddress: row.ipAddress ?? null,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    impersonated: Boolean(
      (row as typeof row & { impersonatedBy?: string | null }).impersonatedBy
    ),
  }));
}

/** Revokes one session by id so tokens never reach the browser. */
export async function revokeUserSessionById(
  userId: string,
  sessionId: string
): Promise<boolean> {
  try {
    const requestHeaders = await headers();
    const { sessions: rows } = await auth.api.listUserSessions({
      headers: requestHeaders,
      body: { userId },
    });
    const target = rows.find((row) => row.id === sessionId);
    if (!target) return false;
    await auth.api.revokeUserSession({
      headers: requestHeaders,
      body: { sessionToken: target.token },
    });
    return true;
  } catch (error) {
    console.error("Error revoking session:", error);
    return false;
  }
}

export async function getUsersByRole(): Promise<
  { role: string; count: number }[]
> {
  await assertAdmin();
  // Primary role (except the default "user") plus every secondary role, counted in SQL.
  const result = await db.execute<{ role: string; count: number }>(sql`
    SELECT role, COUNT(*)::int AS count FROM (
      SELECT ${users.role} AS role FROM ${users} WHERE ${users.role} <> 'user'
      UNION ALL
      SELECT unnest(${users.other_roles})::text AS role FROM ${users}
    ) AS all_roles
    GROUP BY role
  `);
  return result.rows.map((row) => ({
    role: String(row.role),
    count: Number(row.count),
  }));
}

export async function getUsersByDepartment(): Promise<
  { department: string; count: number }[]
> {
  await assertAdmin();
  return db
    .select({
      department: users.department,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(users)
    .groupBy(users.department);
}

export async function getUsersByGender(): Promise<Record<string, number>> {
  await assertAdmin();
  const result = await db
    .select({
      gender: users.gender,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(users)
    .groupBy(users.gender);
  return Object.fromEntries(result.map((row) => [row.gender, row.count]));
}

/** Distinct users with an unexpired session. */
export async function getActiveSessions(): Promise<number> {
  await assertAdmin();
  const result = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${sessions.userId})::int` })
    .from(sessions)
    .where(sql`${sessions.expiresAt} > ${new Date()}`);
  return result[0]?.count ?? 0;
}
