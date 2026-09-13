"use server";

import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "~/auth";
import dbConnect from "~/lib/dbConnect";
import {
  HostelModel,
  HostelStudentModel,
  type IHostelType,
  OutPassModel,
} from "~/models/hostel_n_outpass";

type DashboardStats = {
  pendingOutpasses: number;
  /** Students currently outside campus. */
  activeOutpasses: number;
  totalStudents: number;
  bannedStudents: number;
};

type ActionResponse<T = unknown> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;

export type PendingOutpass = {
  _id: string;
  reason: string;
  roomNumber: string;
  expectedOutTime: string;
  expectedInTime: string;
  createdAt: string;
  student: { name: string; rollNumber: string } | null;
};

/** The hostel's warden, one of its administrators, or a platform admin. */
const authorizeHostel = cache(async (hostelSlug: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized" as const };

  await dbConnect();
  const hostel = await HostelModel.findOne({ slug: hostelSlug })
    .select("_id warden.email administrators.email")
    .lean<Pick<IHostelType, "_id" | "warden" | "administrators">>();
  if (!hostel) return { error: "Hostel not found" as const };

  const email = session.user.email;
  const isAuthorized =
    hostel.warden?.email === email ||
    hostel.administrators?.some((admin) => admin.email === email) ||
    session.user.role === "admin";
  if (!isAuthorized) return { error: "Forbidden Access" as const };

  return { hostelId: hostel._id };
});

export async function getWardenDashboardStats(
  hostelSlug: string
): ActionResponse<DashboardStats> {
  try {
    const access = await authorizeHostel(hostelSlug);
    if ("error" in access) return { success: false, error: access.error };

    const hostelId = access.hostelId;
    const [pendingCount, activeCount, studentCount, bannedCount] =
      await Promise.all([
        OutPassModel.countDocuments({ hostel: hostelId, status: "pending" }),
        OutPassModel.countDocuments({ hostel: hostelId, status: "in_use" }),
        HostelStudentModel.countDocuments({ hostelId }),
        HostelStudentModel.countDocuments({ hostelId, banned: true }),
      ]);

    return {
      success: true,
      data: {
        pendingOutpasses: pendingCount,
        activeOutpasses: activeCount,
        totalStudents: studentCount,
        bannedStudents: bannedCount,
      },
    };
  } catch (error) {
    console.error("Stats Fetch Error:", error);
    return { success: false, error: "Failed to load dashboard stats" };
  }
}

/** Oldest pending requests first, so the queue is worked in order. */
export async function getPendingOutpasses(
  hostelSlug: string,
  page = 1,
  limit = 20
): ActionResponse<PendingOutpass[]> {
  try {
    const access = await authorizeHostel(hostelSlug);
    if ("error" in access) return { success: false, error: access.error };

    const safeLimit = Math.min(Math.max(1, limit), 50);
    const requests = await OutPassModel.find({
      hostel: access.hostelId,
      status: "pending",
    })
      .select(
        "reason roomNumber expectedOutTime expectedInTime createdAt student"
      )
      .populate("student", "name rollNumber")
      .sort({ createdAt: 1 })
      .skip((Math.max(1, page) - 1) * safeLimit)
      .limit(safeLimit)
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(requests)) };
  } catch (error) {
    console.error("Pending outpass fetch error:", error);
    return { success: false, error: "Failed to fetch requests" };
  }
}
