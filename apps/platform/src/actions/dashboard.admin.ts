"use server";
import type { InferSelectModel } from "drizzle-orm";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { db } from "~/db/connect";
import { accounts, sessions, users } from "~/db/schema/auth-schema";
import dbConnect from "~/lib/dbConnect";
import CommunityPostModel from "~/models/community";
import { EventModel } from "~/models/events";
import PollModel from "~/models/poll";
import ResultModel from "~/models/result";
import { calculateGrowthPercentage, calculateTrend, DateRange, generateGraphData, getDateRanges, getPeriodLabel, GraphDataPoint, PeriodSummary, TimeInterval } from "~/utils/process";
import { updateHostelStudent } from "./hostel.core";

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





/**
 * Calculate user count and growth metrics for a given time interval
 * @param timeInterval - The time period to analyze
 * @returns User count, growth metrics, trend information, and graph-ready data
 * @throws {Error} If an invalid time interval is provided or database query fails
 */
export async function users_CountAndGrowth(
  timeInterval: TimeInterval
): Promise<UserCountAndGrowthResult> {
  try {
    const now = new Date();
    
    // Get current and previous period date ranges
    const { current, previous } = getDateRanges(timeInterval, now);

    // Execute all queries in parallel for better performance
    const [totalUsersResult, currentPeriodResult, previousPeriodResult, timeSeriesData] = 
      await Promise.all([
        // Total user count (all time)
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(users)
          .execute(),
        
        // Current period count
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(users)
          .where(
            and(
              gte(users.createdAt, current.start),
              lte(users.createdAt, current.end)
            )
          )
          .execute(),
        
        // Previous period count
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(users)
          .where(
            and(
              gte(users.createdAt, previous.start),
              lte(users.createdAt, previous.end)
            )
          )
          .execute(),

        // Time series data for graph
        fetchTimeSeriesData(timeInterval, current, previous),
      ]);

    const totalUsers = totalUsersResult[0]?.count ?? 0;
    const currentPeriodCount = currentPeriodResult[0]?.count ?? 0;
    const previousPeriodCount = previousPeriodResult[0]?.count ?? 0;

    // Calculate growth metrics
    const growth = currentPeriodCount - previousPeriodCount;
    const growthPercent = calculateGrowthPercentage(
      currentPeriodCount,
      previousPeriodCount
    );
    const trend = calculateTrend(growth);

    // Generate graph data
    const graphData = generateGraphData(timeSeriesData, timeInterval);

    return {
      currentPeriodCount,
      totalUsers,
      growth,
      growthPercent,
      trend,
      periodStart: current.start,
      periodEnd: current.end,
      previousPeriodCount,
      graphData,
      summary: {
        currentPeriod: {
          start: current.start,
          end: current.end,
          userCount: currentPeriodCount,
          label: getPeriodLabel(timeInterval, 'current'),
        },
        previousPeriod: {
          start: previous.start,
          end: previous.end,
          userCount: previousPeriodCount,
          label: getPeriodLabel(timeInterval, 'previous'),
        },
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to calculate user count and growth: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}


/**
 * Fetch time series data for graphing
 */
async function fetchTimeSeriesData(
  timeInterval: TimeInterval,
  current: DateRange,
  previous: DateRange
) {
  const truncateExpression = getTruncateExpression(timeInterval);
  
  // Fetch data for both current and previous periods
  const [currentData, previousData] = await Promise.all([
    db
      .select({
        timestamp: sql<Date>`${truncateExpression}`.as('timestamp'),
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(users)
      .where(
        and(
          gte(users.createdAt, current.start),
          lte(users.createdAt, current.end)
        )
      )
      .groupBy(sql`${truncateExpression}`)
      .orderBy(sql`${truncateExpression}`)
      .execute(),
    
    db
      .select({
        timestamp: sql<Date>`${truncateExpression}`.as('timestamp'),
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(users)
      .where(
        and(
          gte(users.createdAt, previous.start),
          lte(users.createdAt, previous.end)
        )
      )
      .groupBy(sql`${truncateExpression}`)
      .orderBy(sql`${truncateExpression}`)
      .execute(),
  ]);

  return { currentData, previousData };
}


/**
 * Get the appropriate SQL date truncation expression based on interval
 * This works for PostgreSQL - adjust for other databases
 */
function getTruncateExpression(timeInterval: TimeInterval) {
  switch (timeInterval) {
    case "last_hour":
      // Truncate to minute
      return sql`DATE_TRUNC('minute', ${users.createdAt})`;
    case "last_24_hours":
      // Truncate to hour
      return sql`DATE_TRUNC('hour', ${users.createdAt})`;
    case "last_week":
      // Truncate to day
      return sql`DATE_TRUNC('day', ${users.createdAt})`;
    case "last_month":
      // Truncate to day
      return sql`DATE_TRUNC('day', ${users.createdAt})`;
    case "last_year":
      // Truncate to month
      return sql`DATE_TRUNC('month', ${users.createdAt})`;
    default:
      return sql`DATE_TRUNC('day', ${users.createdAt})`;
  }
}

interface PlatformDBStats {
  results: number;
  polls: number;
  communityPosts: number;
  events: number;
}
export async function getPlatformDBStats(): Promise<PlatformDBStats> {
  try {
    await dbConnect();
    const promises = [
      ResultModel.countDocuments(),
      PollModel.countDocuments(),
      CommunityPostModel.countDocuments(),
      EventModel.countDocuments(),
    ];
    const [resultsCount, pollsCount, communityPostsCount, eventsCount] =
      await Promise.all(promises);

    return {
      results: resultsCount,
      polls: pollsCount,
      communityPosts: communityPostsCount,
      events: eventsCount,
    };
  } catch (error) {
    console.error("Error extracting visitor count:", error);
    return {
      results: 0,
      polls: 0,
      communityPosts: 0,
      events: 0,
    };
  }
}

export async function flushCache() {
  try {
    // await redis?.flushall();
    return Promise.resolve(true);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

// Infer the User model from the schema
type User = InferSelectModel<typeof users>;

type UserSortField = keyof Pick<
  User,
  "createdAt" | "updatedAt" | "name" | "username"
>;

interface UserListOptions {
  sortBy?: UserSortField; // Restrict sortBy to valid fields
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  searchQuery?: string;
}

export async function getUser(userId: string): Promise<User | null> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId)) // Fetch the user by their ID
    .limit(1) // Limit to 1 result since ID is unique
    .execute();

  return user.length > 0 ? user[0] : null; // Return the first user or null if not found
}

export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<User | null> {
  try {
    await db.update(users).set(data).where(eq(users.id, userId)).execute();
    const user = await getUser(userId);
    if (data.hostelId && user) {
      console.log("Hostel updating for user:", user.email);
      await updateHostelStudent(user.email, {
        hostelId: data.hostelId,
      });
      console.log("Hostel updated for user:", user.email);
    }
    return user;
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
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
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
    return Promise.resolve(true);
  } catch (error) {
    console.error("Error changing user password:", error);
    return false;
  }
}

/**
 * User Statistics Functions
 */
export async function getTotalUsers(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .execute();
  return result[0]?.count ?? 0;
}

export async function getUsersByRole(): Promise<
  { role: string; count: number }[]
> {
  // const result = await db
  //   .select({
  //     role: users.role,
  //     count: sql<number>`COUNT(*)`,
  //   })
  //   .from(users)
  //   .groupBy(users.role)
  //   .execute();
  // return result;
  // const result = await db
  //   .select({
  //     role: sql<string>`role_value`,
  //     count: sql<number>`COUNT(*)`,
  //   })
  //   .from(
  //     // Create a derived table that combines main role and other_roles
  //     db
  //       .select({
  //         role_value: users.role,
  //       })
  //       .from(users)
  //       .unionAll(
  //         db
  //           .select({
  //             role_value: sql<string>`unnest(${users.other_roles})::text`,
  //           })
  //           .from(users)
  //           .where(sql`array_length(${users.other_roles}, 1) > 0`)
  //       )
  //       .as("all_roles")
  //   )
  //   .groupBy(sql`role_value`)
  //   .execute();

  // return result;
  const allUsers = await db
    .select({
      role: users.role,
      other_roles: users.other_roles,
    })
    .from(users)
    .execute();

  const roleCounts: Record<string, number> = {};
  // Iterate through all users to count roles
  for (const user of allUsers) {
    // Count main role
    if (user.role !== "user")
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;

    // Count each role in other_roles (converting enum to string)
    user.other_roles.forEach((otherRole) => {
      const roleString = String(otherRole); // Convert enum to string
      roleCounts[roleString] = (roleCounts[roleString] || 0) + 1;
    });
  }

  return Object.entries(roleCounts).map(([role, count]) => ({ role, count }));
}

export async function getUsersByDepartment(): Promise<
  { department: string; count: number }[]
> {
  const result = await db
    .select({
      department: users.department,
      count: sql<number>`COUNT(*)`,
    })
    .from(users)
    .groupBy(users.department)
    .execute();
  return result;
}

export async function getUsersByGender(): Promise<Record<string, number>> {
  const result = await db
    .select({
      gender: users.gender,
      count: sql<number>`COUNT(*)`,
    })
    .from(users)
    .groupBy(users.gender)
    .execute();
  return result.reduce(
    (acc, curr) => {
      acc[curr.gender] = Number.parseInt(curr.count as unknown as string, 10);
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Session Statistics Functions
 */

export async function getActiveSessions(): Promise<number> {
  const currentTime = new Date();
  const result = await db
    .select({ count: sql<number>`COUNT(DISTINCT "userId")` })
    .from(sessions)
    .where(sql`"expiresAt" > ${currentTime}`)
    .execute();
  return result[0]?.count ?? 0;
}
export async function getSessionsByUserAgent(): Promise<
  { userAgent: string; count: number }[]
> {
  const result = await db
    .select({
      userAgent: sql<string>`COALESCE(${sessions.userAgent}, 'Unknown')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(sessions)
    .groupBy(sessions.userAgent)
    .execute();
  return result;
}

export async function getTotalAccounts(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(accounts)
    .execute();
  return result[0]?.count ?? 0;
}

// Users with the most sessions
export async function mostSessionsUsers(): Promise<
  { userId: string; sessionCount: number }[]
> {
  const result = await db
    .select({
      userId: sessions.userId,
      sessionCount: sql<number>`COUNT(*)`,
    })
    .from(sessions)
    .groupBy(sessions.userId)
    .orderBy(desc(sql`COUNT(*)`))
    .execute();
  return result;
}

// Average session duration
export async function averageSessionDuration(): Promise<number | null> {
  const result = await db
    .select({
      avgDuration: sql<number>`AVG(EXTRACT(EPOCH FROM ("expiresAt" - "createdAt")))`,
    })
    .from(sessions)
    .execute();
  return result[0]?.avgDuration ?? null;
}

// Sessions by user (most/least active users)
export async function sessionActivity(): Promise<{
  mostActive: { userId: string; sessionCount: number } | null;
  leastActive: { userId: string; sessionCount: number } | null;
}> {
  const result = await db
    .select({
      userId: sessions.userId,
      sessionCount: sql<number>`COUNT(*)`,
    })
    .from(sessions)
    .groupBy(sessions.userId)
    .orderBy(desc(sql`COUNT(*)`), asc(sql`COUNT(*)`))
    .execute();

  return {
    mostActive: result[0] ?? null,
    leastActive: result[result.length - 1] ?? null,
  };
}

// Total user growth over time
export async function userGrowthOverTime(): Promise<
  { date: string; count: number }[]
> {
  const result = await db
    .select({
      date: sql<string>`DATE_TRUNC('month', "createdAt")`.as("date"),
      count: sql<number>`COUNT(*)`,
    })
    .from(users)
    .groupBy(sql`DATE_TRUNC('month', "createdAt")`)
    .orderBy(desc(sql`DATE_TRUNC('month', "createdAt")`))
    .execute();
  return result;
}

// Session trends (new vs recurring)
export async function sessionTrends(): Promise<{
  newSessions: number;
  recurringSessions: number;
}> {
  const newSessions = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(sessions)
    .where(sql`"userId" NOT IN (SELECT DISTINCT "userId" FROM ${sessions})`)
    .execute();

  const recurringSessions = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(sessions)
    .where(sql`"userId" IN (SELECT DISTINCT "userId" FROM ${sessions})`)
    .execute();

  return {
    newSessions: newSessions[0]?.count ?? 0,
    recurringSessions: recurringSessions[0]?.count ?? 0,
  };
}

// External account usage patterns
export async function externalAccountPatterns(): Promise<
  { providerId: string; count: number }[]
> {
  const result = await db
    .select({
      providerId: accounts.providerId,
      count: sql<number>`COUNT(*)`,
    })
    .from(accounts)
    .groupBy(accounts.providerId)
    .orderBy(desc(sql`COUNT(*)`))
    .execute();
  return result;
}

// Engagement trends
export async function userEngagement(): Promise<{
  highestEngagement: { userId: string; sessionCount: number } | null;
  lowestEngagement: { userId: string; sessionCount: number } | null;
}> {
  const result = await db
    .select({
      userId: sessions.userId,
      sessionCount: sql<number>`COUNT(*)`,
    })
    .from(sessions)
    .groupBy(sessions.userId)
    .orderBy(desc(sql`COUNT(*)`), asc(sql`COUNT(*)`))
    .execute();

  return {
    highestEngagement: result[0] ?? null,
    lowestEngagement: result[result.length - 1] ?? null,
  };
}

// Department-wise or role-wise engagement
export async function departmentWiseEngagement(): Promise<
  { department: string; sessionCount: number }[]
> {
  const result = await db
    .select({
      department: users.department,
      sessionCount: sql<number>`COUNT(${sessions.id})`,
    })
    .from(users)
    .leftJoin(sessions, eq(users.id, sessions.userId))
    .groupBy(users.department)
    .orderBy(desc(sql`COUNT(${sessions.id})`))
    .execute();
  return result;
}
