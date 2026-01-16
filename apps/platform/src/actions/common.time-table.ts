"use server";

import { headers } from "next/headers";
import dbConnect from "src/lib/dbConnect";
import Timetable, { type TimeTableWithID } from "src/models/time-table";
import { auth } from "~/auth";
import type { RawTimetableType as RawTimetable } from "~/constants/common.time-table";

export async function getTimeTable(
  department_code: string,
  year: number,
  semester: number
): Promise<TimeTableWithID | null> {
  try {
    await dbConnect();
    // Find the timetable by department code, year and semester
    const timetable = await Timetable.findOne({
      department_code: department_code,
      year: year,
      semester: semester,
    }).exec();

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

    // Find all timetables
    const timetables = await Timetable.find({})
      .select("department_code sectionName year semester author updatedAt")
      .sort({ department_code: 1, year: 1, semester: 1 })
      .exec();

    return Promise.resolve(JSON.parse(JSON.stringify(timetables)));
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch timetables");
  }
}
export async function createTimeTable(timetableData: RawTimetable) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session) {
    return Promise.reject("You need to be logged in to view the timetable");
  }
  try {
    if (
      session.user.other_roles.includes("student") &&
      session.user.other_roles.length === 1
    ) {
      return Promise.reject("Student can't create a timetable");
    }

    // Validate the timetable data
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

    // Create a new timetable document
    const newTimetable = new Timetable({
      department_code: timetableData.department_code,
      sectionName: timetableData.sectionName,
      year: timetableData.year,
      semester: timetableData.semester,
      schedule: timetableData.schedule,
      author: session.user.id,
    });

    // Save the timetable document
    await newTimetable.save();

    return Promise.resolve("Timetable created successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to create timetable");
  }
}
export async function deleteTimeTable(timetableId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return Promise.reject("You need to be logged in to delete a timetable");
  }

  try {
    if (
      !timetable_authorization.includes(session.user.role) &&
      !session.user.other_roles.some((role) =>
        timetable_authorization.includes(role)
      )
    ) {
      return Promise.reject("Student can't delete a timetable");
    }
    await dbConnect();

    // Find the timetable by ID
    const timetable = await Timetable.findById(timetableId);

    if (!timetable) {
      return Promise.reject("Timetable not found");
    }

    // Delete the timetable
    await timetable.deleteOne();

    return Promise.resolve("Timetable deleted successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to delete timetable");
  }
}

const timetable_authorization = ["admin", "moderator", "faculty", "cr"];
export async function updateTimeTable(
  timetableId: string,
  timetableData: Partial<TimeTableWithID>
) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return Promise.reject("You need to be logged in to update a timetable");
  }

  try {
    if (
      !timetable_authorization.includes(session.user.role) &&
      !session.user.other_roles.some((role) =>
        timetable_authorization.includes(role)
      )
    ) {
      return Promise.reject(
        session.user.other_roles[0] + " can't update a timetable"
      );
    }
    await dbConnect();

    // Find the timetable by ID
    const timetable = await Timetable.findById(timetableId);

    if (!timetable) {
      return Promise.reject("Timetable not found");
    }

    // Update the timetable fields
    timetable.department_code = timetableData.department_code;
    timetable.sectionName = timetableData.sectionName;
    timetable.year = timetableData.year;
    timetable.semester = timetableData.semester;
    timetable.schedule = timetableData.schedule;

    // Save the updated timetable
    await timetable.save();

    return Promise.resolve("Timetable updated successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to update timetable");
  }
}
