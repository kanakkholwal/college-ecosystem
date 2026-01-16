import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { DEPARTMENT_CODES } from "~/constants/core.departments";

export const departmentCodeEnum = pgEnum(
  "department_code_enum",
  DEPARTMENT_CODES as [string, ...string[]]
);

// Sub-schema for Events
export const dailyEvents = pgTable("daily_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
});

// Sub-schema for TimeSlots
export const timeSlots = pgTable("time_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  startTime: integer("start_time").notNull(),
  endTime: integer("end_time").notNull(),
  events: jsonb("events").notNull(), // Array of events as JSON objects
});

// Sub-schema for Daily Schedule
export const dailySchedules = pgTable("daily_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  day: integer("day").notNull(), // 0 to 6
  timeSlots: jsonb("time_slots").notNull(), // Array of time slots as JSON objects
});

// Main Timetable Schema
export const timetables = pgTable("timetables", {
  id: uuid("id").defaultRandom().primaryKey(),
  departmentCode: departmentCodeEnum("department_code").notNull(), // Enum for department codes
  sectionName: text("section_name").notNull(),
  year: integer("year").notNull(),
  semester: integer("semester").notNull(),
  schedule: jsonb("schedule").notNull(), // Array of daily schedules as JSON objects
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
