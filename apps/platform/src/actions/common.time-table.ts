"use server";

import dbConnect from "src/lib/dbConnect";
import Timetable, { type TimeTableWithID } from "src/models/time-table";
import { getCurrentSession } from "~/auth/guards";
import { ROLES_ENUMS } from "~/constants";
import {
  type RawTimetableType as RawTimetable,
  rawTimetableSchema,
} from "~/constants/common.time-table";
import { isObjectIdString } from "~/constants/hostel_n_outpass";
import {
  type ActionResult,
  runAction,
  UserFacingError,
} from "~/lib/action-result";
import { serialize } from "~/utils/serialize";

const TIMETABLE_EXISTS = "Timetable already exists";
const TIMETABLE_NOT_FOUND = "Timetable not found";

const TIMETABLE_MANAGERS: readonly string[] = [
  ROLES_ENUMS.ADMIN,
  ROLES_ENUMS.MODERATOR,
  ROLES_ENUMS.FACULTY,
  ROLES_ENUMS.CR,
];

async function requireTimetableManager(verb: string) {
  const session = await getCurrentSession();
  if (!session) {
    throw new UserFacingError(
      `You need to be logged in to ${verb} a timetable`
    );
  }
  const allowed =
    TIMETABLE_MANAGERS.includes(session.user.role) ||
    session.user.other_roles.some((role) => TIMETABLE_MANAGERS.includes(role));
  if (!allowed) {
    throw new UserFacingError(
      `You don't have permission to ${verb} a timetable`
    );
  }
  return session;
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

    return timetable ? serialize<TimeTableWithID>(timetable) : null;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch timetable");
  }
}

export async function getAllTimeTables(): Promise<Partial<TimeTableWithID>[]> {
  try {
    await dbConnect();

    const timetables = await Timetable.find({})
      .select("department_code sectionName year semester author updatedAt")
      .sort({ department_code: 1, year: 1, semester: 1, sectionName: 1 })
      .exec();

    return serialize<Partial<TimeTableWithID>[]>(timetables);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch timetables");
  }
}

export async function createTimeTable(
  timetableData: RawTimetable
): Promise<ActionResult<string>> {
  return runAction(
    "Failed to create timetable",
    async () => {
      const session = await requireTimetableManager("create");
      const parsed = rawTimetableSchema.safeParse(timetableData);
      if (!parsed.success || !parsed.data.sectionName) {
        throw new UserFacingError("Invalid timetable data");
      }
      const { department_code, sectionName, year, semester, schedule } =
        parsed.data;
      await dbConnect();

      const existingTimetable = await Timetable.exists({
        department_code,
        sectionName,
        year,
        semester,
      });
      if (existingTimetable) throw new UserFacingError(TIMETABLE_EXISTS);

      const newTimetable = new Timetable({
        department_code,
        sectionName,
        year,
        semester,
        schedule,
        author: session.user.id,
      });

      await newTimetable.save();

      return "Timetable created successfully";
    },
    { duplicate: TIMETABLE_EXISTS }
  );
}

export async function deleteTimeTable(
  timetableId: string
): Promise<ActionResult<string>> {
  return runAction("Failed to delete timetable", async () => {
    await requireTimetableManager("delete");
    if (!isObjectIdString(timetableId)) {
      throw new UserFacingError(TIMETABLE_NOT_FOUND);
    }
    await dbConnect();

    const timetable = await Timetable.findById(timetableId);
    if (!timetable) throw new UserFacingError(TIMETABLE_NOT_FOUND);

    await timetable.deleteOne();

    return "Timetable deleted successfully";
  });
}

export async function updateTimeTable(
  timetableId: string,
  timetableData: RawTimetable | Partial<TimeTableWithID>
): Promise<ActionResult<string>> {
  return runAction(
    "Failed to update timetable",
    async () => {
      await requireTimetableManager("update");
      const parsed = rawTimetableSchema.safeParse(timetableData);
      if (!parsed.success || !parsed.data.sectionName) {
        throw new UserFacingError(
          parsed.error?.issues[0]?.message ?? "Invalid timetable data"
        );
      }
      const { department_code, sectionName, year, semester, schedule } =
        parsed.data;
      if (!isObjectIdString(timetableId)) {
        throw new UserFacingError(TIMETABLE_NOT_FOUND);
      }

      await dbConnect();

      const timetable = await Timetable.findById(timetableId);
      if (!timetable) throw new UserFacingError(TIMETABLE_NOT_FOUND);

      // Renaming onto another section's key would leave two rows no link can tell apart.
      const clash = await Timetable.exists({
        _id: { $ne: timetableId },
        department_code,
        sectionName,
        year,
        semester,
      });
      if (clash) throw new UserFacingError(TIMETABLE_EXISTS);

      // Status is not part of the editor, so the stored value is left alone.
      timetable.department_code = department_code;
      timetable.sectionName = sectionName;
      timetable.year = year;
      timetable.semester = semester;
      timetable.schedule = schedule;

      await timetable.save();

      return "Timetable updated successfully";
    },
    { duplicate: TIMETABLE_EXISTS }
  );
}
