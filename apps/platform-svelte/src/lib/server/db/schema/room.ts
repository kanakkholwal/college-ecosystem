import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

// Sub-schema for Usage History
export const roomUsageHistory = pgTable("room_usage_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id").references(() => rooms.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Main Room Schema
export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomNumber: text("room_number").notNull().unique(),
  roomType: varchar("room_type", { length: 20 }) // "classroom", "conference", etc.
    .notNull()
    .default("classroom"),
  currentStatus: varchar("current_status", { length: 10 }) // "available", "occupied"
    .notNull()
    .default("available"),
  lastUpdatedTime: timestamp("last_updated_time", {
    withTimezone: true,
  }).defaultNow(),
  capacity: integer("capacity"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Define types for rooms and usage history
export type RoomSelect = InferSelectModel<typeof rooms>;
export type RoomInsert = InferInsertModel<typeof rooms>;
export type UsageHistoryInsert = InferInsertModel<typeof roomUsageHistory>;
export type UsageHistorySelect = InferSelectModel<typeof roomUsageHistory>;
