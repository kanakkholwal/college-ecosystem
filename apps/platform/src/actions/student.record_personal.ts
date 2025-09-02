"use server";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { db } from "~/db/connect";
import {
  personalAttendance,
  personalAttendanceRecords,
} from "~/db/schema/attendance_record";

export type PersonalAttendanceRecord = InferSelectModel<
  typeof personalAttendanceRecords
>;
export type InsertPersonalAttendanceRecord = InferInsertModel<
  typeof personalAttendanceRecords
>;

export type PersonalAttendance = InferSelectModel<typeof personalAttendance>;
export type InsertPersonalAttendance = InferInsertModel<
  typeof personalAttendance
>;

// Create a new attendance record
export async function createAttendance(
  recordData: Omit<
    PersonalAttendance,
    "id" | "userId" | "createdAt" | "updatedAt"
  >
) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session) {
    throw new Error("You need to be logged in to create an attendance record.");
  }

  try {
    await db.insert(personalAttendance).values({
      ...recordData,
      userId: session.user.id,
    });
    revalidatePath("/attendance");
    return "Attendance record created successfully.";
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create attendance record.");
  }
}

// Fetch all attendance records for the logged-in user
export async function getAttendanceRecords() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session) {
    throw new Error("You need to be logged in to fetch attendance records.");
  }

  try {
    const records = await db
      .select()
      .from(personalAttendanceRecords)
      .where(eq(personalAttendanceRecords.userId, session.user.id));

    const attendances = await db
      .select()
      .from(personalAttendance)
      .where(eq(personalAttendance.userId, session.user.id));

    const mappedAttendance = attendances.map((attendance) => ({
      ...attendance,
      records: records.filter((record) => record.recordId === attendance.id),
    }));

    return mappedAttendance;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch attendance records.");
  }
}

// Update attendance (add a class and update present/absent status)
export async function updateAttendanceRecord(
  recordId: string,
  isPresent: boolean
): Promise<string> {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session) {
    throw new Error("Authentication required.");
  }

  try {
    // Add attendance details
    await db.insert(personalAttendanceRecords).values({
      recordId,
      userId: session.user.id,
      isPresent,
      date: new Date(),
    });

    revalidatePath("/attendance");
    return "Attendance record updated successfully.";
  } catch (error) {
    console.error("Error updating attendance record:", error);
    throw new Error("Failed to update attendance record.");
  }
}

// Delete an attendance record
export async function deleteAttendanceRecord(
  recordId: string
): Promise<string> {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session) {
    throw new Error("Authentication required.");
  }

  try {
    await db.transaction(async (tx) => {
      // Delete related attendance records
      await tx
        .delete(personalAttendanceRecords)
        .where(eq(personalAttendanceRecords.recordId, recordId));

      // Delete the main attendance entry
      await tx
        .delete(personalAttendance)
        .where(eq(personalAttendance.id, recordId));
    });

    revalidatePath("/attendance");
    return "Attendance record deleted successfully.";
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    throw new Error("Failed to delete attendance record.");
  }
}

// Force update an attendance record with partial data
export async function forceUpdateAttendanceRecord(
  recordId: string,
  data: Partial<InsertPersonalAttendanceRecord>
) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session) {
    throw new Error("You need to be logged in to update an attendance record.");
  }

  try {
    await db.transaction(async (tx) => {
      // Delete related attendance records
      await tx
        .delete(personalAttendanceRecords)
        .where(eq(personalAttendanceRecords.recordId, recordId));

      // Delete the main attendance entry
      await tx
        .delete(personalAttendance)
        .where(eq(personalAttendance.id, recordId));
    });

    revalidatePath("/attendance");
    return "Attendance record updated successfully.";
  } catch (err) {
    console.error(err);
    throw new Error("Failed to update attendance record.");
  }
}
