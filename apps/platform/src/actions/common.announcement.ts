"use server";
import { revalidatePath } from "next/cache";
import dbConnect from "src/lib/dbConnect";
import { getCurrentSession } from "~/auth/guards";
import { ROLES_ENUMS } from "~/constants";
import {
  type RawAnnouncementType,
  rawAnnouncementSchema,
} from "~/constants/common.announcement";
import { isObjectIdString } from "~/constants/hostel_n_outpass";
import {
  type ActionResult,
  runAction,
  UserFacingError,
} from "~/lib/action-result";
import Announcement, {
  type AnnouncementTypeWithId,
} from "~/models/announcement";
import { serialize } from "~/utils/serialize";

const ANNOUNCEMENT_NOT_FOUND = "Announcement not found";

export async function createAnnouncement(
  announcementData: RawAnnouncementType
): Promise<ActionResult<string>> {
  return runAction("Failed to create announcement", async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UserFacingError(
        "You need to be logged in to create an announcement"
      );
    }
    const data = rawAnnouncementSchema.parse(announcementData);
    await dbConnect();
    const announcement = new Announcement({
      ...data,
      createdBy: {
        id: session.user.id,
        name: session.user.name,
        username: session.user.username,
      },
    });
    await announcement.save();
    revalidatePath(`/announcements`);
    return "Announcement created successfully";
  });
}

export async function getAnnouncements(): Promise<AnnouncementTypeWithId[]> {
  try {
    await dbConnect();
    const announcements = await Announcement.find();
    return serialize<AnnouncementTypeWithId[]>(announcements);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch announcements");
  }
}

export async function getAnnouncementById(
  id: string
): Promise<AnnouncementTypeWithId | null> {
  if (!isObjectIdString(id)) return null;
  try {
    await dbConnect();
    const announcement = await Announcement.findById(id);
    return serialize<AnnouncementTypeWithId | null>(announcement);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch announcement");
  }
}

export async function updateAnnouncement(
  id: string,
  announcementData: RawAnnouncementType
): Promise<ActionResult<string>> {
  return runAction("Failed to update announcement", async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UserFacingError(
        "You need to be logged in to update an announcement"
      );
    }
    if (!isObjectIdString(id))
      throw new UserFacingError(ANNOUNCEMENT_NOT_FOUND);
    // Parsing strips unknown keys, so the client can never overwrite createdBy.
    const data = rawAnnouncementSchema.parse(announcementData);
    await dbConnect();
    const announcement = await Announcement.findById(id);
    if (!announcement) throw new UserFacingError(ANNOUNCEMENT_NOT_FOUND);
    if (
      announcement.createdBy.id !== session.user.id &&
      session.user.role !== ROLES_ENUMS.ADMIN
    ) {
      throw new UserFacingError(
        "You are not authorized to update this announcement"
      );
    }
    announcement.set(data);
    await announcement.save();
    revalidatePath(`/announcements`);
    return "Announcement updated successfully";
  });
}

export async function deleteAnnouncement(
  id: string
): Promise<ActionResult<string>> {
  return runAction("Failed to delete announcement", async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UserFacingError(
        "You need to be logged in to delete an announcement"
      );
    }
    if (!isObjectIdString(id))
      throw new UserFacingError(ANNOUNCEMENT_NOT_FOUND);
    await dbConnect();
    const announcement = await Announcement.findById(id);
    if (!announcement) throw new UserFacingError(ANNOUNCEMENT_NOT_FOUND);
    if (
      announcement.createdBy.id !== session.user.id &&
      session.user.role !== ROLES_ENUMS.ADMIN
    ) {
      throw new UserFacingError(
        "You are not authorized to delete this announcement"
      );
    }
    await announcement.deleteOne();
    revalidatePath(`/announcements`);
    return "Announcement deleted successfully";
  });
}
