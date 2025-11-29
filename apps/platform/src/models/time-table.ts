import mongoose, { Document, Schema } from "mongoose";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";

import type {
  RawEvent,
  RawTimeSlot,
  RawTimetableType,
} from "~/constants/common.time-table";

export type EventTypeWithID = RawEvent;

export interface IEvent extends Document, Omit<RawEvent, "_id"> { }

export type TimeSlotWithID = RawTimeSlot & { _id: string };

export interface RawDaySchedule {
  day: number;
  timeSlots: RawTimeSlot[];
}
export type DayScheduleWithID = RawDaySchedule & { _id: string };
export interface IDaySchedule extends Document, RawDaySchedule { }

export interface PublicTimetable extends RawTimetableType {
  author: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface TimeTableWithID {
  _id: string;
  department_code: string;
  sectionName: string;
  year: number;
  semester: number;
  schedule: DayScheduleWithID[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "published" | "archived";
}

export interface ITimetable extends Document, PublicTimetable { }

const timetableSchema = new Schema<ITimetable>(
  {
    department_code: {
      type: String,
      required: true,
      enum: DEPARTMENTS_LIST.map((dept) => dept.code),
      trim: true,
    },
    sectionName: { type: String, required: true },
    year: { type: Number, required: true, min: 1, max: 5 },
    semester: { type: Number, required: true, min: 1, max: 10 },
    schedule: [
      {
        day: { type: Number, required: true, min: 0, max: 6 },
        timeSlots: [
          {
            startTime: { type: Number, required: true, min: 0, max: 9 },
            endTime: { type: Number, required: true, min: 0, max: 10 },
            events: [
              {
                title: { type: String, required: true },
                description: { type: String },
                heldBy: { type: String },
                _id: { type: String }, // Unique identifier for the event
              },
            ],
          },
        ],
      },
    ],
    author: { type: String, required: true }, // Assuming you have a User model
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft"
    }
  },
  {
    timestamps: true,
  }
);

const Timetable =
  mongoose.models?.Timetable ||
  mongoose.model<ITimetable>("Timetable", timetableSchema);

export default Timetable;
