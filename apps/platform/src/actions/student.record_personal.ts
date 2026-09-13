"use server";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "~/auth/server";
import {
  type AttendanceSubjectInput,
  attendanceSubjectSchema,
} from "~/constants/attendance.personal";
import { db } from "~/db/connect";
import {
  personalAttendance,
  personalAttendanceRecords,
} from "~/db/schema/attendance_record";

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type AttendanceSubject = {
  id: string;
  subjectCode: string;
  subjectName: string;
  present: number;
  total: number;
};

export type AttendanceLog = { id: string; date: string; isPresent: boolean };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Revalidates the list and every [id] page under it.
const refresh = () =>
  revalidatePath("/[moderator]/attendance-personal", "layout");

async function requireUserId() {
  const session = await getSession();
  return session?.user.id ?? null;
}

async function ownsSubject(userId: string, recordId: string) {
  if (!UUID.test(recordId)) return false;
  const [row] = await db
    .select({ id: personalAttendance.id })
    .from(personalAttendance)
    .where(
      and(
        eq(personalAttendance.id, recordId),
        eq(personalAttendance.userId, userId)
      )
    )
    .limit(1);
  return Boolean(row);
}

export async function createAttendance(
  input: AttendanceSubjectInput
): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sign in again to add a subject." };

  const parsed = attendanceSubjectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const [row] = await db
      .insert(personalAttendance)
      .values({ ...parsed.data, userId })
      .returning({ id: personalAttendance.id });
    refresh();
    return { ok: true, data: { id: row.id } };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Couldn't add the subject. Try again." };
  }
}

/** Subjects of the signed-in user with present and total class counts. */
export async function getAttendanceSubjects(): Promise<AttendanceSubject[]> {
  const userId = await requireUserId();
  if (!userId) throw new Error("Unauthorized");

  const logs = personalAttendanceRecords;
  return db
    .select({
      id: personalAttendance.id,
      subjectCode: personalAttendance.subjectCode,
      subjectName: personalAttendance.subjectName,
      total: sql<number>`COUNT(${logs.id})::int`,
      present: sql<number>`(COUNT(${logs.id}) FILTER (WHERE ${logs.isPresent}))::int`,
    })
    .from(personalAttendance)
    .leftJoin(logs, eq(logs.recordId, personalAttendance.id))
    .where(eq(personalAttendance.userId, userId))
    .groupBy(personalAttendance.id)
    .orderBy(personalAttendance.createdAt);
}

/** Adds one class to a subject the signed-in user owns. */
export async function updateAttendanceRecord(
  recordId: string,
  isPresent: boolean
): Promise<ActionResult<AttendanceLog>> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sign in again to mark a class." };
  if (!(await ownsSubject(userId, recordId))) {
    return { ok: false, error: "This subject isn't in your list." };
  }

  try {
    const [row] = await db
      .insert(personalAttendanceRecords)
      .values({ recordId, userId, isPresent: Boolean(isPresent) })
      .returning();
    refresh();
    return {
      ok: true,
      data: {
        id: row.id,
        date: (row.date ?? new Date()).toISOString(),
        isPresent: row.isPresent,
      },
    };
  } catch (error) {
    console.error("Error updating attendance record:", error);
    return { ok: false, error: "Couldn't save that class. Try again." };
  }
}

/** Removes one marked class; used for undo and for fixing a wrong mark. */
export async function deleteAttendanceLog(
  logId: string
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sign in again." };
  if (!UUID.test(logId)) return { ok: false, error: "Class not found." };

  try {
    const deleted = await db
      .delete(personalAttendanceRecords)
      .where(
        and(
          eq(personalAttendanceRecords.id, logId),
          eq(personalAttendanceRecords.userId, userId)
        )
      )
      .returning({ id: personalAttendanceRecords.id });
    if (deleted.length === 0) return { ok: false, error: "Class not found." };
    refresh();
    return { ok: true, data: null };
  } catch (error) {
    console.error("Error deleting attendance log:", error);
    return { ok: false, error: "Couldn't remove that class. Try again." };
  }
}

/** Deletes a subject the signed-in user owns, with all its marked classes. */
export async function deleteAttendanceRecord(
  recordId: string
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sign in again." };
  if (!(await ownsSubject(userId, recordId))) {
    return { ok: false, error: "This subject isn't in your list." };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(personalAttendanceRecords)
        .where(
          and(
            eq(personalAttendanceRecords.recordId, recordId),
            eq(personalAttendanceRecords.userId, userId)
          )
        );
      await tx
        .delete(personalAttendance)
        .where(
          and(
            eq(personalAttendance.id, recordId),
            eq(personalAttendance.userId, userId)
          )
        );
    });
    refresh();
    return { ok: true, data: null };
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    return { ok: false, error: "Couldn't delete the subject. Try again." };
  }
}

/** One subject of the signed-in user with its classes, newest first. */
export async function getAttendanceRecordById(recordId: string) {
  const userId = await requireUserId();
  if (!userId) throw new Error("Unauthorized");
  if (!UUID.test(recordId)) return null;

  const [parent, logs] = await Promise.all([
    db
      .select({
        id: personalAttendance.id,
        subjectCode: personalAttendance.subjectCode,
        subjectName: personalAttendance.subjectName,
      })
      .from(personalAttendance)
      .where(
        and(
          eq(personalAttendance.id, recordId),
          eq(personalAttendance.userId, userId)
        )
      )
      .limit(1),
    db
      .select({
        id: personalAttendanceRecords.id,
        date: personalAttendanceRecords.date,
        isPresent: personalAttendanceRecords.isPresent,
      })
      .from(personalAttendanceRecords)
      .where(
        and(
          eq(personalAttendanceRecords.recordId, recordId),
          eq(personalAttendanceRecords.userId, userId)
        )
      )
      .orderBy(desc(personalAttendanceRecords.date)),
  ]);

  if (parent.length === 0) return null;
  return {
    ...parent[0],
    logs: logs.map(
      (l): AttendanceLog => ({
        id: l.id,
        date: (l.date ?? new Date(0)).toISOString(),
        isPresent: l.isPresent,
      })
    ),
  };
}
