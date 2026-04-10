import dbConnect from '$lib/server/db/mongo';
import type { SessionUser } from '$lib/server/auth';
import type { RawAnnouncementType } from '$lib/constants/common.announcement';
import Announcement, { type AnnouncementTypeWithId } from '$lib/server/models/announcement';

export async function createAnnouncement(
	announcementData: RawAnnouncementType,
	user: SessionUser
) {
	try {
		await dbConnect();
		const announcement = new Announcement({
			...announcementData,
			createdBy: {
				id: user.id,
				name: user.name,
				username: user.username
			}
		});
		await announcement.save();
		return 'Announcement created successfully';
	} catch (err) {
		console.error(err);
		throw new Error('Failed to create announcement');
	}
}

export async function getAnnouncements(): Promise<AnnouncementTypeWithId[]> {
	try {
		await dbConnect();
		const announcements = await Announcement.find().sort({ createdAt: -1 });
		return JSON.parse(JSON.stringify(announcements));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch announcements');
	}
}

export async function getAnnouncementById(id: string): Promise<AnnouncementTypeWithId> {
	try {
		await dbConnect();
		const announcement = await Announcement.findById(id);
		return JSON.parse(JSON.stringify(announcement));
	} catch (err) {
		console.error(err);
		throw new Error('Failed to fetch announcement');
	}
}

export async function updateAnnouncement(id: string, announcementData: RawAnnouncementType) {
	try {
		await dbConnect();
		await Announcement.findByIdAndUpdate(id, announcementData, { new: true });
		return 'Announcement updated successfully';
	} catch (err) {
		console.error(err);
		throw new Error('Failed to update announcement');
	}
}

export async function deleteAnnouncement(id: string, user: SessionUser) {
	try {
		await dbConnect();
		const announcement = await Announcement.findById(id);
		if (!announcement) throw new Error('Announcement not found');

		if (announcement.createdBy.id !== user.id && user.role !== 'admin') {
			throw new Error('You are not authorized to delete this announcement');
		}
		await announcement.deleteOne();
		return 'Announcement deleted successfully';
	} catch (err) {
		console.error(err);
		throw new Error('Failed to delete announcement');
	}
}
