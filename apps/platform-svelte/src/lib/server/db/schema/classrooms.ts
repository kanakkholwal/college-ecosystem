// ./db/schemas/classrooms.ts
import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  foreignKey,
} from "drizzle-orm/pg-core";

export const classrooms = pgTable("classrooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  classroomId: integer("classroom_id").references(() => classrooms.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  classroomId: integer("classroom_id").references(() => classrooms.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  classroomId: integer("classroom_id").references(() => classrooms.id),
  day: varchar("day", { length: 10 }).notNull(), // e.g., "Monday"
  time: varchar("time", { length: 10 }).notNull(), // e.g., "10:00 AM"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  classroomId: integer("classroom_id").references(() => classrooms.id),
  date: timestamp("date").defaultNow().notNull(),
  present: boolean("present").default(false).notNull(),
});
