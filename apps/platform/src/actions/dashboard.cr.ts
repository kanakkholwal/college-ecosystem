"use server";
import { headers } from "next/headers";
import dbConnect from "src/lib/dbConnect";
import { getStudentInfo } from "src/lib/student/actions";
import Timetable, { type TimeTableWithID } from "src/models/time-table";
import type { studentInfoType } from "src/types/student";
import { auth } from "~/auth";

export async function getInfo(): Promise<{
  studentInfo: studentInfoType;
  timetables: TimeTableWithID[];
  stats: {
    totalSchedules: number;
    lastUpdated: Date | null;
  };
}> {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user.other_roles.includes("cr")) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  const studentInfo = await getStudentInfo(session?.user.username);

  // Fetch timetables created by this CR or for their specific batch
  const timetables = await Timetable.find({
    department_code: studentInfo.departmentCode,
    year: studentInfo.currentYear,
    // You might want to filter by semester too
  })
  .sort({ updatedAt: -1 }) // Get latest first
  .lean<TimeTableWithID[]>();

  const stats = {
    totalSchedules: timetables.length,
    lastUpdated: timetables.length > 0 ? timetables[0].updatedAt : null,
  };

  return {
    studentInfo,
    timetables: JSON.parse(JSON.stringify(timetables)),
    stats: JSON.parse(JSON.stringify(stats)),
  };
}