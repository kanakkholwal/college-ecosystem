import type { Session } from "~/auth";
import { ROLES_ENUMS } from "~/constants";

type AccessUser = Pick<Session["user"], "role" | "other_roles"> | undefined;

const hasAny = (user: AccessUser, roles: string[]) =>
  !!user &&
  (roles.includes(user.role) ||
    user.other_roles.some((role) => roles.includes(role)));

// Keep in step with the checks in common.course, common.time-table and common.room.
export const canEditCourses = (user: AccessUser) =>
  !!user &&
  (user.role === ROLES_ENUMS.ADMIN ||
    user.other_roles.includes(ROLES_ENUMS.CR) ||
    user.other_roles.includes(ROLES_ENUMS.FACULTY));

export const canManageTimetables = (user: AccessUser) =>
  hasAny(user, [
    ROLES_ENUMS.ADMIN,
    ROLES_ENUMS.MODERATOR,
    ROLES_ENUMS.FACULTY,
    ROLES_ENUMS.CR,
  ]);

export const canToggleRooms = canEditCourses;

export const isAdmin = (user: AccessUser) => user?.role === ROLES_ENUMS.ADMIN;
