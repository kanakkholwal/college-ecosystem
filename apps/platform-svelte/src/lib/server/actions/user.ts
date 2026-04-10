import type { InferSelectModel } from 'drizzle-orm';
import { eq, or, sql } from 'drizzle-orm';
import { db } from '$lib/server/db/connect';
import { personalAttendance, personalAttendanceRecords, roomUsageHistory } from '$lib/server/db/schema';
import { accounts, sessions, users } from '$lib/server/db/schema/auth-schema';
import dbConnect from '$lib/server/db/mongo';
import Announcement from '$lib/server/models/announcement';
import CommunityPost, { CommunityComment } from '$lib/server/models/community';
import { HostelStudentModel } from '$lib/server/models/hostel_n_outpass';
import PollModel from '$lib/server/models/poll';

type User = InferSelectModel<typeof users>;

export async function getUserByEmail(email: string): Promise<User | null> {
	const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
	return user.length > 0 ? user[0] : null;
}

export async function getUserById(userId: string): Promise<User | null> {
	const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
	return user.length > 0 ? user[0] : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
	const user = await db
		.select()
		.from(users)
		.where(or(eq(users.username, username), eq(users.id, username)))
		.limit(1);
	return user.length > 0 ? user[0] : null;
}

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

export async function getUsersByRole(role: string): Promise<User[]> {
	return db.select().from(users).where(eq(users.role, role));
}

export async function getUsersByDepartment(department: string): Promise<User[]> {
	return db.select().from(users).where(eq(users.department, department));
}

export async function getUsersByOtherRoles(role: string): Promise<User[]> {
	return db
		.select()
		.from(users)
		.where(sql`${role} = ANY(${users.other_roles})`);
}

export async function deleteUserResourcesById(userId: string): Promise<void> {
	try {
		await db.transaction(async (tx) => {
			await tx
				.delete(personalAttendanceRecords)
				.where(eq(personalAttendanceRecords.userId, userId));
			await tx.delete(personalAttendance).where(eq(personalAttendance.userId, userId));
			await tx.delete(roomUsageHistory).where(eq(roomUsageHistory.userId, userId));
			await tx.delete(sessions).where(eq(sessions.userId, userId));
			await tx.delete(accounts).where(eq(accounts.userId, userId));
			await tx.delete(users).where(eq(users.id, userId));

			try {
				await dbConnect();
				await Announcement.deleteMany({ 'createdBy.id': userId });
				await CommunityPost.deleteMany({ 'author.id': userId });
				await CommunityComment.deleteMany({ 'author.id': userId });
				await HostelStudentModel.deleteMany({ userId });
				await PollModel.deleteMany({ createdBy: userId });
			} catch (error) {
				console.log('Error deleting mongoose models:', error);
			}
		});
	} catch (error) {
		console.error('Error deleting user:', error);
		throw new Error('Failed to delete user resources');
	}
}

export async function getUserPlatformActivities(userId: string, _username: string) {
	try {
		await dbConnect();
		const activitiesPromise = [
			PollModel.countDocuments({ createdBy: userId }),
			Announcement.countDocuments({ createdBy: userId }),
			CommunityPost.countDocuments({ 'author.id': userId }),
			CommunityComment.countDocuments({ 'author.id': userId })
		];
		const [pollsCount, announcementsCount, communityPostsCount, communityCommentsCount] =
			await Promise.all(activitiesPromise);
		return {
			pollsCount,
			announcementsCount,
			communityPostsCount,
			communityCommentsCount
		};
	} catch (error) {
		console.error('Failed to fetch user activities:', error);
		return {
			pollsCount: 0,
			announcementsCount: 0,
			communityPostsCount: 0,
			communityCommentsCount: 0
		};
	}
}
