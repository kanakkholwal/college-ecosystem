"use server";
import { headers } from "next/headers";
import dbConnect from "src/lib/dbConnect";
import { getStudentInfo } from "src/lib/student/actions";
import Timetable from "src/models/time-table";
import type { studentInfoType } from "src/types/student";
import { auth } from "~/auth";
import { ROLES_ENUMS } from "~/constants";
import { serialize } from "~/utils/serialize";

export type CrTimetableSummary = {
  _id: string;
  department_code: string;
  sectionName: string;
  year: number;
  semester: number;
  updatedAt: string;
};

export async function getInfo(): Promise<{
  studentInfo: studentInfoType | null;
  timetables: CrTimetableSummary[];
  stats: {
    totalSchedules: number;
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
      stats: { totalSchedules: 0, lastUpdated: null },
    };
  }

  await dbConnect();
  // The cards only need metadata; the schedule grid is the heavy part of each document.
  const timetables = await Timetable.find({
    department_code: studentInfo.departmentCode,
    year: studentInfo.currentYear,
  })
    .select("department_code sectionName year semester updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  const plain: CrTimetableSummary[] = serialize(timetables);
  return {
    studentInfo,
    timetables: plain,
    stats: {
      totalSchedules: plain.length,
      lastUpdated: plain[0]?.updatedAt ?? null,
    },
  };
}
