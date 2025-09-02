"use server";
import dbConnect from "src/lib/dbConnect";
import { getStudentInfo } from "src/lib/student/actions";
import Timetable, { type TimeTableWithID } from "src/models/time-table";
import type { studentInfoType } from "src/types/student";
import { headers } from "next/headers";
import { auth } from "~/auth";

export async function getInfo(): Promise<{
  studentInfo: studentInfoType;
  timetables: TimeTableWithID[];
}> {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user.other_roles.includes("cr")) {
    throw new Error("You are not authorized to perform this action");
  }

  await dbConnect();
  const studentInfo = await getStudentInfo(session?.user.username);

  const timetables = await Timetable.find({
    department_code: studentInfo.departmentCode,
    year: studentInfo.currentYear,
    semester: studentInfo.currentSemester,
  }).lean();

  return Promise.resolve({
    studentInfo,
    timetables: JSON.parse(JSON.stringify(timetables)),
  });
}

export async function getCrInfo() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user.other_roles.includes("cr")) {
    throw new Error("You are not authorized to perform this action");
  }

  await dbConnect();
  const studentInfo = await getStudentInfo(session?.user.username);
}
