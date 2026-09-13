"use server";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "~/auth";
import { ROLES_ENUMS } from "~/constants";
import { db } from "~/db/connect";
import {
  personalAttendance,
  personalAttendanceRecords,
} from "~/db/schema/attendance_record";
import dbConnect from "~/lib/dbConnect";
import { getStudentInfo } from "~/lib/student/actions";
import { OutPassModel } from "~/models/hostel_n_outpass";
import Timetable from "~/models/time-table";
import type { RawTimeSlot } from "~/constants/common.time-table";
import { getResultByRollNo } from "./common.result";
import { getHostelForStudent } from "./hostel.core";
import { getUserPlatformActivities } from "./user.core";

const getStudentSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (
    !user ||
    (!user.other_roles?.includes(ROLES_ENUMS.STUDENT) &&
      user.role !== ROLES_ENUMS.ADMIN)
  ) {
    throw new Error("Unauthorized");
  }
  return user;
});

export type StudentAcademics = {
  rollNo: string;
  branch: string;
  programme: string;
  currentSemester: number;
  semesters: { semester: string; sgpi: number; cgpi: number }[];
  latestCourses: number;
  rank: { class: number; branch: number; batch: number; college: number };
  timetable: {
    href: string;
    sectionName: string;
    schedule: { timeSlots: RawTimeSlot[] }[];
  } | null;
} | null;

export const getStudentAcademics = cache(
  async (): Promise<StudentAcademics> => {
    const user = await getStudentSession();
    const [result, info] = await Promise.all([
      getResultByRollNo(user.username),
      getStudentInfo(user.username).catch(() => null),
    ]);
    if (!result || !info) return null;

    let timetable: NonNullable<StudentAcademics>["timetable"] = null;
    if (info.departmentCode && info.currentYear > 0) {
      await dbConnect();
      const doc = await Timetable.findOne({
        department_code: info.departmentCode,
        year: info.currentYear,
        semester: info.currentSemester,
      })
        .select("sectionName schedule.timeSlots")
        .lean<{
          sectionName: string;
          schedule: { timeSlots: RawTimeSlot[] }[];
        }>();
      if (doc) {
        timetable = JSON.parse(
          JSON.stringify({
            href: `/schedules/${info.departmentCode}/${info.currentYear}/${info.currentSemester}`,
            sectionName: doc.sectionName,
            schedule: doc.schedule,
          })
        );
      }
    }

    const latest = result.semesters.at(-1);
    return {
      rollNo: result.rollNo,
      branch: result.branch,
      programme: result.programme,
      currentSemester: info.currentSemester,
      semesters: result.semesters.map((s) => ({
        semester: s.semester,
        sgpi: s.sgpi,
        cgpi: s.cgpi,
      })),
      latestCourses: latest?.courses?.length ?? 0,
      rank: {
        class: result.rank?.class ?? 0,
        branch: result.rank?.branch ?? 0,
        batch: result.rank?.batch ?? 0,
        college: result.rank?.college ?? 0,
      },
      timetable,
    };
  }
);

export type StudentAttendance = {
  subjects: {
    id: string;
    name: string;
    code: string;
    present: number;
    total: number;
  }[];
  present: number;
  total: number;
};

export const getStudentAttendance = cache(
  async (): Promise<StudentAttendance> => {
    const user = await getStudentSession();
    const records = personalAttendanceRecords;
    const rows = await db
      .select({
        id: personalAttendance.id,
        name: personalAttendance.subjectName,
        code: personalAttendance.subjectCode,
        total: sql<number>`COUNT(${records.id})::int`,
        present: sql<number>`(COUNT(${records.id}) FILTER (WHERE ${records.isPresent}))::int`,
      })
      .from(personalAttendance)
      .leftJoin(records, eq(records.recordId, personalAttendance.id))
      .where(eq(personalAttendance.userId, user.id))
      .groupBy(personalAttendance.id);

    return {
      subjects: rows,
      present: rows.reduce((acc, r) => acc + r.present, 0),
      total: rows.reduce((acc, r) => acc + r.total, 0),
    };
  }
);

export type StudentHostel = {
  hostelName: string;
  roomNumber: string;
  banned: boolean;
  bannedTill: string | null;
  pendingOutpasses: number;
  activeOutpasses: number;
  latestOutpass: {
    id: string;
    status: string;
    reason: string;
    expectedOutTime: string;
  } | null;
} | null;

export const getStudentHostel = cache(async (): Promise<StudentHostel> => {
  await getStudentSession();
  const { hostel, hosteler } = await getHostelForStudent();
  if (!hostel || !hosteler) return null;

  await dbConnect();
  // Counted by the hosteler id; the old roll-number history scanned the 10 newest passes campus-wide.
  const [pending, active, latest] = await Promise.all([
    OutPassModel.countDocuments({ student: hosteler._id, status: "pending" }),
    OutPassModel.countDocuments({
      student: hosteler._id,
      status: { $in: ["approved", "in_use"] },
    }),
    OutPassModel.findOne({ student: hosteler._id })
      .sort({ createdAt: -1 })
      .select("status reason expectedOutTime")
      .lean<{
        _id: unknown;
        status: string;
        reason: string;
        expectedOutTime: Date;
      }>(),
  ]);

  return {
    hostelName: hostel.name,
    roomNumber: hosteler.roomNumber,
    banned: Boolean(hosteler.banned),
    bannedTill: hosteler.bannedTill
      ? new Date(hosteler.bannedTill).toISOString()
      : null,
    pendingOutpasses: pending,
    activeOutpasses: active,
    latestOutpass: latest
      ? {
          id: String(latest._id),
          status: latest.status,
          reason: latest.reason,
          expectedOutTime: new Date(latest.expectedOutTime).toISOString(),
        }
      : null,
  };
});

export const getStudentActivity = cache(async () => {
  const user = await getStudentSession();
  return getUserPlatformActivities(user.id, user.username);
});
