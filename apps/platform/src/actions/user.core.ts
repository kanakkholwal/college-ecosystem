"use server";
import type { InferSelectModel } from "drizzle-orm";
import { eq, or } from "drizzle-orm";
import { db } from "~/db/connect";
import {
  personalAttendance,
  personalAttendanceRecords,
  roomUsageHistory,
} from "~/db/schema";
import {
  accounts,
  emailVerifications,
  sessions,
  users,
} from "~/db/schema/auth-schema";
import { getSession } from "~/auth/server";
import dbConnect from "~/lib/dbConnect";
import Announcement from "~/models/announcement";
import CommunityPost, { CommunityComment } from "~/models/community";
import { HostelStudentModel } from "~/models/hostel_n_outpass";
import PollModel from "~/models/poll";

type User = InferSelectModel<typeof users>;

/** Deletes a user and everything they own. Admins only, and never their own account. */
export async function deleteUserResourcesById(userId: string): Promise<void> {
  // Matches the better-auth admin plugin's adminRole, which gates removeUser.
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return Promise.reject("Unauthorized");
  }
  if (session?.user.id === userId) {
    return Promise.reject("You cannot delete your own account");
  }
  // Polls store the author's username, not the id, so read it before the row is gone.
  const [target] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  try {
    await db.transaction(async (tx) => {
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
      // No ON DELETE CASCADE: a pending verification row blocks the user delete.
      await tx
        .delete(emailVerifications)
        .where(eq(emailVerifications.userId, userId));
      await tx.delete(users).where(eq(users.id, userId));
      // Mongo is not part of the transaction; failures here leave orphans, not a live account.
      try {
        await dbConnect();
        await Promise.all([
          Announcement.deleteMany({ "createdBy.id": userId }),
          CommunityPost.deleteMany({ "author.id": userId }),
          CommunityComment.deleteMany({ "author.id": userId }),
          HostelStudentModel.deleteMany({ userId }),
          ...(target
            ? [PollModel.deleteMany({ createdBy: target.username })]
            : []),
        ]);
      } catch (error) {
        console.error("Error deleting mongoose models:", error);
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
      PollModel.countDocuments({ createdBy: username }),
      Announcement.countDocuments({ "createdBy.id": userId }),
      CommunityPost.countDocuments({ "author.id": userId }),
      CommunityComment.countDocuments({ "author.id": userId }),
    ];
    // allSettled, not all: one failing count must not zero out the other three.
    const results = await Promise.allSettled(activitiesPromise);
    const [
      pollsCount,
      announcementsCount,
      communityPostsCount,
      communityCommentsCount,
    ] = results.map((result, index) => {
      if (result.status === "fulfilled") return result.value;
      console.error(`Activity count ${index} failed:`, result.reason);
      return 0;
    });
    return {
      pollsCount,
      announcementsCount,
      communityPostsCount,
      communityCommentsCount,
    };
  } catch (error) {
    console.error("Failed to fetch user activities:", error);
    return {
      pollsCount: 0,
      announcementsCount: 0,
      communityPostsCount: 0,
      communityCommentsCount: 0,
    };
  }
}
