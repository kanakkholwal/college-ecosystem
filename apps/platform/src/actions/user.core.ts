"use server";
import type { InferSelectModel } from "drizzle-orm";
import { eq, or, sql } from "drizzle-orm";
import { db } from "~/db/connect";
import {
  personalAttendance,
  personalAttendanceRecords,
  roomUsageHistory,
} from "~/db/schema";
import { accounts, sessions, users } from "~/db/schema/auth-schema";
import dbConnect from "~/lib/dbConnect";
import Announcement from "~/models/announcement";
import CommunityPost, { CommunityComment } from "~/models/community";
import { HostelStudentModel } from "~/models/hostel_n_outpass";
import PollModel from "~/models/poll";

// Infer the user model type from the schema
type User = InferSelectModel<typeof users>;

// Get user by Email
export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user.length > 0 ? user[0] : null;
}

// Get user by User ID
export async function getUserById(userId: string): Promise<User | null> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user.length > 0 ? user[0] : null;
}

// Get user by Username
export async function getUserByUsername(
  username: string
): Promise<User | null> {
  const user = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.username, username),
        eq(users.id, username) // Allow ID as username for legacy support
      )
    )
    .limit(1);
  return user.length > 0 ? user[0] : null;
}

// Update user by ID
export async function updateUserById(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  const [updatedUser] = await db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser || null;
}

// Get all users by role
export async function getUsersByRole(role: string): Promise<User[]> {
  return db.select().from(users).where(eq(users.role, role));
}

// Get users by department
export async function getUsersByDepartment(
  department: string
): Promise<User[]> {
  return db.select().from(users).where(eq(users.department, department));
}

// Get users with specific roles (array match for `other_roles`)
export async function getUsersByOtherRoles(role: string): Promise<User[]> {
  return db
    .select()
    .from(users)
    .where(sql`${role} = ANY(${users.other_roles})`);
}

// delete user resources
export async function deleteUserResourcesById(userId: string): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // Delete user sessions if any
      await tx
        .delete(personalAttendanceRecords)
        .where(eq(personalAttendanceRecords.userId, userId));
      await tx
        .delete(personalAttendance)
        .where(eq(personalAttendance.userId, userId));
      await tx
        .delete(roomUsageHistory)
        .where(eq(roomUsageHistory.userId, userId));
      await tx.delete(sessions).where(eq(sessions.userId, userId));
      await tx.delete(accounts).where(eq(accounts.userId, userId));
      await tx.delete(users).where(eq(users.id, userId));
      // mongoose models
      try {
        await dbConnect();
        await Announcement.deleteMany({
          "createdBy.id": userId,
        });
        console.log("Deleted Announcement for user:", userId);
        await CommunityPost.deleteMany({
          "author.id": userId,
        });
        console.log("Deleted CommunityPost for user:", userId);
        await CommunityComment.deleteMany({
          "author.id": userId,
        });
        console.log("Deleted CommunityComment for user:", userId);
        await HostelStudentModel.deleteMany({
          userId: userId,
        });
        console.log("Deleted HostelStudentModel for user:", userId);
        await PollModel.deleteMany({
          createdBy: userId,
        });
        console.log("Deleted PollModel for user:", userId);
      } catch (error) {
        console.log("Error deleting mongoose models:", error);
      }
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Promise.reject("Failed to delete user resources");
  }
}

export async function getUserPlatformActivities(
  userId: string,
  username: string
) {
  try {
    await dbConnect();
    const activitiesPromise = [
      PollModel.countDocuments({ createdBy: userId }),
      Announcement.countDocuments({ createdBy: userId }),
      CommunityPost.countDocuments({ "author.id": userId }),
      CommunityComment.countDocuments({ "author.id": userId }),
    ];
    const [
      pollsCount,
      announcementsCount,
      communityPostsCount,
      communityCommentsCount,
    ] = await Promise.all(activitiesPromise);
    return {
      pollsCount,
      announcementsCount,
      communityPostsCount,
      communityCommentsCount,
      // resourcesCount
    };
  } catch (error) {
    console.error("Failed to fetch user activities:", error);
    return {
      pollsCount: 0,
      announcementsCount: 0,
      communityPostsCount: 0,
      communityCommentsCount: 0,
      // resourcesCount: 0,
    };
  }
}
