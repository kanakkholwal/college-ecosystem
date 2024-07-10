"use server";
import { getSession } from "src/lib/auth";
import dbConnect from "src/lib/dbConnect";
import { getStudentInfo } from "src/lib/student/actions";
import Timetable, { TimeTableWithID } from "src/models/time-table";
import { sessionType } from "src/types/session";
import { studentInfoType } from "src/types/student";

export async function getInfo(): Promise<{
  studentInfo: studentInfoType;
  timetables: TimeTableWithID[];
}> {
  const session = (await getSession()) as sessionType;

  if (!session.user.roles.includes("cr")) {
    throw new Error("You are not authorized to perform this action");
  }

  await dbConnect();
  const studentInfo = await getStudentInfo(
    session.user.rollNo === "kanakkholwal" ? "21dec026" : session.user.rollNo!
  );

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
