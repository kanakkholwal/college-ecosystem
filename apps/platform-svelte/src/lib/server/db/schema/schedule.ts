import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const schedulesModeEnums = pgEnum("schedules_mode_enum", [
  "day",
  "week",
  "month",
]);

// scheduleAccess
export const scheduleAccess = pgTable("schedule_access", {
  id: uuid("id").defaultRandom().primaryKey().unique(),
  scheduleId: uuid("schedule_id").references(() => schedules.id),
  accessType: text("access_type").notNull(), // e.g., 'all', 'department', 'batch', 'programme'
  accessValue: text("access_value"), // e.g., 'CSE', '2022', 'B.Tech'
});

export const scheduleEvents = pgTable("schedule_events", {
  id: uuid("id").defaultRandom().primaryKey().unique(),
  scheduleId: uuid("schedule_id").references(() => schedules.id),
  title: text("title").notNull(),
  color: text("color").notNull(), // For calendar representation
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Main schedules Schema
export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey().unique(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
