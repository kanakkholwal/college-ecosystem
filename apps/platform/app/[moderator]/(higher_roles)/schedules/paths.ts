import type { TimeTableWithID } from "~/models/time-table";

type Key = Pick<
  Partial<TimeTableWithID>,
  "department_code" | "year" | "semester" | "sectionName"
>;

/** The section segment keeps two sections of one semester on separate pages. */
export const timetableEditHref = (moderator: string, t: Key) =>
  `/${moderator}/schedules/${t.department_code}/${t.year}/${t.semester}${
    t.sectionName ? `/${encodeURIComponent(t.sectionName)}` : ""
  }`;
