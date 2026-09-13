import {
  getDepartmentCode,
  getDepartmentShort,
} from "~/constants/core.departments";
import { changeCase } from "~/utils/string";

export const roleLabel = (role: string) =>
  changeCase(role.replaceAll("_", " "), "title");

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

export const departmentShort = (department: string) =>
  getDepartmentShort(getDepartmentCode(department)) || department;

export const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
