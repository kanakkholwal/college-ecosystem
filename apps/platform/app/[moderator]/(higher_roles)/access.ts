import type { Session } from "~/auth";

type AccessUser = Pick<Session["user"], "role" | "other_roles"> | undefined;

const hasAny = (user: AccessUser, roles: string[]) =>
  !!user &&
  (roles.includes(user.role) ||
    user.other_roles.some((role) => roles.includes(role)));

// Keep in step with the checks in common.course, common.time-table and common.room.
export const canEditCourses = (user: AccessUser) =>
  !!user &&
  (user.role === "admin" ||
    user.other_roles.includes("cr") ||
    user.other_roles.includes("faculty"));

export const canManageTimetables = (user: AccessUser) =>
  hasAny(user, ["admin", "moderator", "faculty", "cr"]);

export const canToggleRooms = canEditCourses;

export const isAdmin = (user: AccessUser) => user?.role === "admin";
