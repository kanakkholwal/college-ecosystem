import mongoose, { Schema, type Document } from "mongoose";
import type { rawEventsSchemaType } from "~/constants/common.events";

interface IEvent extends Document, rawEventsSchemaType {}

export interface EventJSONType extends rawEventsSchemaType {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventsSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, minlength: 3 },
    description: { type: String },
    links: { type: [String], default: [] },
    time: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      optional: true,
      default: null,
    },
    eventType: { type: String, required: true },
    location: { type: String, optional: true },
  },
  {
    timestamps: true,
  }
);

export const EventModel =
  mongoose.models?.Event || mongoose.model<IEvent>("Event", eventsSchema);
