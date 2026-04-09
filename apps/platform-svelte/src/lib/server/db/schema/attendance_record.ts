import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth-schema";

export const personalAttendanceRecords = pgTable(
  "personal_attendance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: timestamp("date", { withTimezone: true }).defaultNow(),
    isPresent: boolean("is_present").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    recordId: uuid("record_id")
      .notNull()
      .references(() => personalAttendance.id),
  }
);

// Attendance Table Schema
export const personalAttendance = pgTable("personal_attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  subjectCode: text("subject_code").notNull(),
  subjectName: text("subject_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type InsertPersonalAttendanceRecord = InferInsertModel<
  typeof personalAttendanceRecords
>;
export type PersonalAttendanceRecord = InferSelectModel<
  typeof personalAttendanceRecords
>;

export type PersonalAttendance = InferSelectModel<typeof personalAttendance>;
export type InsertPersonalAttendance = InferInsertModel<
  typeof personalAttendance
>;

export type PersonalAttendanceWithRecords = PersonalAttendance & {
  records: PersonalAttendanceRecord[];
};
