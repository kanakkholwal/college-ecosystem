import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const calender_sem_events = pgTable(
  "calender_sem_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    start_date: timestamp("start_date").notNull(),
    end_date: timestamp("end_date").notNull(),
    all_day: boolean("all_day").default(false), // For events spanning the entire day
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at")
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    // pk: primaryKey({
    //   columns: [table.id, table.event_id],
    // }),
  })
);

export const calender_sem_event_tags = pgTable("calender_sem_event_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  event_id: uuid("event_id")
    .notNull()
    .references(() => calender_sem_events.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
});

export const calender_sem_event_participants = pgTable(
  "calender_sem_event_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    event_id: uuid("event_id")
      .notNull()
      .references(() => calender_sem_events.id, { onDelete: "cascade" }),
    participant_id: uuid("participant_id").notNull(),
    role: text("role"), // e.g., "organizer", "participant"
  }
);

// export const events = pgTable("events", {
//   id: text("id").primaryKey(), // UUID for event ID
//   name: varchar("name", { length: 255 }).notNull(),
//   description: text("description"), // Optional event description
//   start_date: date("start_date").notNull(),
//   end_date: date("end_date").notNull(),
//   color: varchar("color", { length: 7 }), // Optional color for event
//   created_by: text("created_by").notNull(), // User ID of the event creator
//   created_at: date("created_at").defaultNow(),
//   updated_at: date("updated_at").defaultNow(),
// });

// export const calendar_events = pgTable(
//   "calendar_events",
//   {
//     calendar_id: text("calendar_id").notNull(),
//     event_id: text("event_id").notNull(),
//   },
//   (table) => ({
//     pk: primaryKey({columns:[table.calendar_id, table.event_id]}),
//   })
// );

// export const calendars = pgTable("calendars", {
//   id: text("id").primaryKey(),
//   name: varchar("name", { length: 255 }).notNull(),
//   description: text("description"),
//   year: integer("year").notNull(),
// });
