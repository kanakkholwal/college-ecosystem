import mongoose, { type Document, Schema } from "mongoose";
import {
  RELATED_FOR_TYPES,
  RawAnnouncementType,
} from "~/constants/common.announcement";

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

interface IAnnouncement extends Document, RawAnnouncementType {
  expiresAt: Date;
  createdBy: {
    id: string;
    name: string;
    username: string;
  };
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
    createdBy: {
      type: { id: String, name: String, username: String },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models?.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", announcementSchema);
