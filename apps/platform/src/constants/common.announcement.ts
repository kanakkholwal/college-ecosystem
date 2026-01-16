import * as z from "zod";
import { Content } from "@tiptap/react";

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
  content_json: z.custom<Content>(),
  expiresAt: z
    .date()
    .refine((date) => date !== null, {
      message: "An expiry Date is required.",
    })
    .refine((date) => date.getTime() > new Date().getTime(), {
      message: "Expiry Date must be in the future.",
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
  createdBy: {
    id: string;
    name: string;
    username: string;
  };
};

interface IAnnouncement extends Document {
  title: string;
  content: string;
  relatedFor: (typeof RELATED_FOR_TYPES)[number];
  expiresAt: Date;
  createdBy: {
    id: string;
    name: string;
    username: string;
  };
  updatedAt: Date;
  createdAt: Date;
}
