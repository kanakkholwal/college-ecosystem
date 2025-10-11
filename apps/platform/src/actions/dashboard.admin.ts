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
import { updateHostelStudent } from "./hostel.core";

export async function users_CountAndGrowth(timeInterval: string): Promise<{
  count: number;
  total: number;
  growth: number;
  growthPercent: number;
  trend: -1 | 1 | 0;
}> {
  let startTime: Date;
  let endTime: Date | null = null; // Used for the current partial interval
  let prevStartTime: Date;
  let prevEndTime: Date;

  // Determine the start and previous intervals based on the time interval
  switch (timeInterval) {
    case "last_hour": {
      startTime = new Date(Date.now() - 60 * 60 * 1000);
      prevStartTime = new Date(startTime.getTime() - 60 * 60 * 1000);
      prevEndTime = startTime;
      break;
    }
    case "last_24_hours": {
      startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      prevStartTime = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
      prevEndTime = startTime;
      break;
    }
    case "last_week": {
      const today = new Date();
      const startOfWeek = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - today.getDay()
      );
      startTime = startOfWeek;
      endTime = today; // Current week up to now
      prevStartTime = new Date(startTime.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevEndTime = startTime;
      break;
    }
    case "last_month": {
      const today = new Date();
      startTime = new Date(today.getFullYear(), today.getMonth(), 1); // Start of this month
      endTime = today; // Current month up to now
      prevStartTime = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Start of last month
      prevEndTime = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of last month
      break;
    }
    case "last_year": {
      const today = new Date();
      startTime = new Date(today.getFullYear(), 0, 1); // Start of this year
      endTime = today; // Current year up to now
      prevStartTime = new Date(today.getFullYear() - 1, 0, 1); // Start of last year
      prevEndTime = new Date(today.getFullYear() - 1, 11, 31); // Last day of last year
      break;
    }
    default:
      throw new Error("Invalid time interval provided");
  }

  // Fetch the total user count
  const totalUsers = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)

    .execute();
  const total = totalUsers[0]?.count ?? 0;

  // Fetch the count of users in the previous interval
  const periodCountQuery = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(
      and(
        gte(users.createdAt, startTime),
        lte(users.createdAt, endTime || new Date())
      )
    );

  const periodCount = periodCountQuery[0]?.count || 0;

  // Calculate growth and growth percentage
  const growth = total - periodCount;
  const growthPercent =
    periodCount === 0
      ? 100
      : (growth / (periodCount === 0 ? 1 : periodCount)) * 100;

  return {
    count: total,
    total,
    growth,
    growthPercent,
    trend: growth > 0 ? 1 : growth < 0 ? -1 : 0,
  };
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
