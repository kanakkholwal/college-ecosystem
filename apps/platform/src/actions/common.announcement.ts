"use server";
import { revalidatePath } from "next/cache";
import dbConnect from "src/lib/dbConnect";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { RawAnnouncementType } from "~/constants/common.announcement";
import Announcement, { AnnouncementTypeWithId } from "~/models/announcement";

export async function createAnnouncement(
  announcementData: RawAnnouncementType
) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session) {
    return Promise.reject("You need to be logged in to create an announcement");
  }
  try {
    await dbConnect();
    // Validate the announcement data
    const announcement = new Announcement({
      ...announcementData,
      createdBy: {
        id: session.user.id,
        name: session.user.name,
        username: session.user.username,
      },
    });
    await announcement.save();
    revalidatePath(`/announcements`);
    return Promise.resolve("Announcement created successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to create announcement");
  }
}
export async function getAnnouncements(): Promise<AnnouncementTypeWithId[]> {
  try {
    await dbConnect();
    const announcements = await Announcement.find();
    return Promise.resolve(JSON.parse(JSON.stringify(announcements)));
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch announcements");
  }
}
export async function getAnnouncementById(
  id: string
): Promise<AnnouncementTypeWithId> {
  try {
    await dbConnect();
    const announcement = await Announcement.findById(id);
    return Promise.resolve(JSON.parse(JSON.stringify(announcement)));
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch announcement");
  }
}
export async function updateAnnouncement(
  id: string,
  announcementData: RawAnnouncementType
) {
  try {
    await dbConnect();
    await Announcement.findByIdAndUpdate(id, announcementData, { new: true });
    revalidatePath(`/announcements`);
    return Promise.resolve("Announcement updated successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to update announcement");
  }
}
export async function deleteAnnouncement(id: string) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    if (!session) {
      return Promise.reject(
        "You need to be logged in to delete an announcement"
      );
    }
    await dbConnect();
    // Check if the announcement exists
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return Promise.reject("Announcement not found");
    }
    // Check if the user is the author of the announcement
    if (
      announcement.createdBy.id !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return Promise.reject(
        "You are not authorized to delete this announcement"
      );
    }
    await announcement.deleteOne();
    // Revalidate the announcements page
    revalidatePath(`/announcements`);
    return Promise.resolve("Announcement deleted successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to delete announcement");
  }
}
