"use server";
import { headers } from "next/headers";
import dbConnect from "src/lib/dbConnect";
import { getStudentInfo } from "src/lib/student/actions";
import Timetable from "src/models/time-table";
import type { studentInfoType } from "src/types/student";
import { auth } from "~/auth";
import { ROLES_ENUMS } from "~/constants";

export type CrTimetableSummary = {
  _id: string;
  department_code: string;
  sectionName: string;
  year: number;
  semester: number;
  status: "draft" | "published" | "archived";
  updatedAt: string;
};

export async function getInfo(): Promise<{
  studentInfo: studentInfoType | null;
  timetables: CrTimetableSummary[];
  stats: {
    totalSchedules: number;
    published: number;
    drafts: number;
    lastUpdated: string | null;
  };
}> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.other_roles?.includes(ROLES_ENUMS.CR)) {
    throw new Error("Unauthorized");
  }

  // A CR without a result record (new batch) still gets a dashboard, just without class data.
  const studentInfo = await getStudentInfo(session.user.username).catch(
    () => null
  );
  if (!studentInfo) {
    return {
      studentInfo: null,
      timetables: [],
      stats: { totalSchedules: 0, published: 0, drafts: 0, lastUpdated: null },
    };
  }

  await dbConnect();
  // The cards only need metadata; the schedule grid is the heavy part of each document.
  const timetables = await Timetable.find({
    department_code: studentInfo.departmentCode,
    year: studentInfo.currentYear,
  })
    .select("department_code sectionName year semester status updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  const plain: CrTimetableSummary[] = JSON.parse(JSON.stringify(timetables));
  return {
    studentInfo,
    timetables: plain,
    stats: {
      totalSchedules: plain.length,
      published: plain.filter((t) => t.status === "published").length,
      // Documents created before the status field existed read as drafts.
      drafts: plain.filter((t) => !t.status || t.status === "draft").length,
      lastUpdated: plain[0]?.updatedAt ?? null,
    },
  };
}
