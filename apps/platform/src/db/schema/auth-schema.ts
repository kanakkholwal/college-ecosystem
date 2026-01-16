import { InferSelectModel } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { DEPARTMENTS } from "~/constants/core.departments";

export const departmentNameEnum = pgEnum("department_name_enum", [
  "Staff",
  ...DEPARTMENTS,
] as [string, ...string[]]);

export const userRolesEnum = pgEnum("user_roles_enum", [
  "admin",
  "student",
  "faculty",
  "hod",
  "cr",
  "staff",
  "assistant",
  "mmca",
  "warden",
  "librarian",
  "assistant_warden",
  "chief_warden",
  "guard",
] as [string, ...string[]]);

export const userGenderEnum = pgEnum("user_gender_enum", [
  "male",
  "female",
  "not_specified",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  displayUsername: text("displayUsername").notNull().default("not_specified"),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  role: text("role").notNull().default("user"),
  other_roles: userRolesEnum("other_roles").array().notNull().default([]),
  other_emails: text("other_emails").array().notNull().default([]),
  gender: userGenderEnum("gender")
    .notNull()
    .default("not_specified")
    .$default(() => "not_specified"),
  hostelId: text("hostelId")
    .default("not_specified")
    .$defaultFn(() => "not_specified"),
  department: departmentNameEnum("department").notNull(),
});

export type UserType = InferSelectModel<typeof users>;

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  impersonatedBy: text("impersonatedBy"),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const emailVerifications = pgTable("email_verifications", {
  id: text("id").primaryKey().default(nanoid(21)),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  email: text("email").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  verified: boolean("verified").notNull().default(false),
  token: text("token").notNull().unique(),
  // The token is a unique identifier for the email verification process
  createdAt: timestamp("createdAt").notNull(),
});
