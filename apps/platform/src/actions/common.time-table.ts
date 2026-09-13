"use server";

import { headers } from "next/headers";
import dbConnect from "src/lib/dbConnect";
import Timetable, { type TimeTableWithID } from "src/models/time-table";
import { auth } from "~/auth";
import type { RawTimetableType as RawTimetable } from "~/constants/common.time-table";

const TIMETABLE_MANAGERS = ["admin", "moderator", "faculty", "cr"];

async function getTimetableManager() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { session: null, allowed: false } as const;
  const allowed =
    TIMETABLE_MANAGERS.includes(session.user.role) ||
    session.user.other_roles.some((role) => TIMETABLE_MANAGERS.includes(role));
  return { session, allowed } as const;
}

/** Omitting `sectionName` returns the first section of that semester. */
export async function getTimeTable(
  department_code: string,
  year: number,
  semester: number,
  sectionName?: string
): Promise<TimeTableWithID | null> {
  try {
    await dbConnect();
    const timetable = await Timetable.findOne({
      department_code,
      year,
      semester,
      ...(sectionName ? { sectionName } : {}),
    })
      .sort({ sectionName: 1 })
      .exec();

    if (!timetable) {
      return Promise.resolve(null);
    }

    return Promise.resolve(JSON.parse(JSON.stringify(timetable)));
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch timetable");
  }
}
export async function getAllTimeTables(): Promise<Partial<TimeTableWithID>[]> {
  try {
    await dbConnect();

    const timetables = await Timetable.find({})
      .select("department_code sectionName year semester author updatedAt")
      .sort({ department_code: 1, year: 1, semester: 1, sectionName: 1 })
      .exec();

    return Promise.resolve(JSON.parse(JSON.stringify(timetables)));
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch timetables");
  }
}
export async function createTimeTable(timetableData: RawTimetable) {
  const { session, allowed } = await getTimetableManager();
  if (!session) {
    return Promise.reject("You need to be logged in to create a timetable");
  }
  if (!allowed) {
    return Promise.reject("You don't have permission to create a timetable");
  }
  try {
    if (
      !timetableData.department_code ||
      !timetableData.sectionName ||
      !timetableData.year ||
      !timetableData.semester ||
      !timetableData.schedule
    ) {
      return Promise.reject("Invalid timetable data");
    }
    await dbConnect();

    const existingTimetable = await Timetable.findOne({
      department_code: timetableData.department_code,
      sectionName: timetableData.sectionName,
      year: timetableData.year,
      semester: timetableData.semester,
    });
    if (existingTimetable) {
      return Promise.reject("Timetable already exists");
    }

    const newTimetable = new Timetable({
      department_code: timetableData.department_code,
      sectionName: timetableData.sectionName,
      year: timetableData.year,
      semester: timetableData.semester,
      schedule: timetableData.schedule,
      author: session.user.id,
    });

    await newTimetable.save();

    return Promise.resolve("Timetable created successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to create timetable");
  }
}
export async function deleteTimeTable(timetableId: string) {
  const { session, allowed } = await getTimetableManager();
  if (!session) {
    return Promise.reject("You need to be logged in to delete a timetable");
  }
  if (!allowed) {
    return Promise.reject("You don't have permission to delete a timetable");
  }

  try {
    await dbConnect();

    const timetable = await Timetable.findById(timetableId);

    if (!timetable) {
      return Promise.reject("Timetable not found");
    }

    await timetable.deleteOne();

    return Promise.resolve("Timetable deleted successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to delete timetable");
  }
}

export async function updateTimeTable(
  timetableId: string,
  timetableData: Partial<TimeTableWithID>
) {
  const { session, allowed } = await getTimetableManager();
  if (!session) {
    return Promise.reject("You need to be logged in to update a timetable");
  }
  if (!allowed) {
    return Promise.reject("You don't have permission to update a timetable");
  }

  try {
    await dbConnect();

    const timetable = await Timetable.findById(timetableId);

    if (!timetable) {
      return Promise.reject("Timetable not found");
    }

    // Renaming onto another section's key would leave two rows no link can tell apart.
    const { department_code, sectionName, year, semester } = timetableData;
    const clash =
      department_code &&
      sectionName &&
      year &&
      semester &&
      (await Timetable.exists({
        _id: { $ne: timetableId },
        department_code,
        sectionName,
        year,
        semester,
      }));
    if (clash) {
      return Promise.reject("Another timetable already uses these details");
    }

    timetable.department_code = timetableData.department_code;
    timetable.sectionName = timetableData.sectionName;
    timetable.year = timetableData.year;
    timetable.semester = timetableData.semester;
    timetable.schedule = timetableData.schedule;

    await timetable.save();

    return Promise.resolve("Timetable updated successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to update timetable");
  }
}
