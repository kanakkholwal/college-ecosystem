import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Sub-schema for Chapter
export const chapters = pgTable("chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  topics: text("topics").array().notNull().default([]),
  lectures: integer("lectures"),
});

// Sub-schema for Books and References
export const booksAndReferences = pgTable("books_and_references", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").references(() => courses.id),
  name: text("name").notNull(),
  link: text("link").notNull(),
  type: varchar("type", { length: 10 }) // "book", "reference", etc.
    .notNull(),
});

// Sub-schema for Previous Papers
export const previousPapers = pgTable("previous_papers", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").references(() => courses.id),
  year: integer("year").notNull(),
  exam: varchar("exam", { length: 10 }) // "midsem", "endsem", "others"
    .notNull(),
  link: text("link").notNull(),
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  code: varchar("code", { length: 10 }) // Adjust length as per your need
    .notNull()
    .unique(),
  type: text("type").notNull(),
  credits: integer("credits").notNull(),
  department: text("department").notNull(),
  outcomes: text("outcomes").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

