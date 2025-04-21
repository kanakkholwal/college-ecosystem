import mongoose, { Document, Schema } from "mongoose";
import * as z from "zod";

export const RELATED_FOR_TYPES = [
  "academics",
  "events",
  "culturalEvents",
  "techEvents",
  "workshops",
  "bloodDonation",
  "others",
] as const;

export const rawAnnouncementSchema = z.object({
  title: z.string().min(5, "Title must be atleast 5 characters long."),
  content: z.string().min(10, "Content must be atleast 10 characters long."),
  expiresAt: z
    .date({
      required_error: "A expiry Date is required.",
    })
    .default(
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Default to 2 days from now
    ),
  relatedFor: z.enum(RELATED_FOR_TYPES),
});
export type RawAnnouncementType = z.infer<typeof rawAnnouncementSchema>;

export type AnnouncementTypeWithId = RawAnnouncementType & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};

interface IAnnouncement extends Document {
  title: string;
  content: string;
  relatedFor: (typeof RELATED_FOR_TYPES)[number];
  expiresAt: Date;
  createdBy: string;
  updatedAt: Date;
  createdAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    relatedFor: { type: String, enum: RELATED_FOR_TYPES, required: true },
    expiresAt: {
      type: Date,
      default: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      index: { expires: "0s" },
    },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models?.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", announcementSchema);
