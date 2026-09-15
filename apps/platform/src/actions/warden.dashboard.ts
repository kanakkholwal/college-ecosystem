"use server";

import { cache } from "react";
import {
  type ActionResult,
  runAction,
  UserFacingError,
} from "~/lib/action-result";
import dbConnect from "~/lib/dbConnect";
import {
  authorizeHostelManager,
  getHostelSession,
  type HostelLean,
  isListedStaff,
} from "~/lib/hostel-access";
import {
  HostelModel,
  HostelStudentModel,
  OutPassModel,
} from "~/models/hostel_n_outpass";
import { serialize } from "~/utils/serialize";

type DashboardStats = {
  pendingOutpasses: number;
  /** Students currently outside campus. */
  activeOutpasses: number;
  totalStudents: number;
  bannedStudents: number;
};

export type PendingOutpass = {
  _id: string;
  reason: string;
  roomNumber: string;
  expectedOutTime: string;
  expectedInTime: string;
  createdAt: string;
  student: { name: string; rollNumber: string } | null;
};

/** Campus-wide roles, or staff listed on the hostel by account id or email in any casing. */
const authorizeHostel = cache(async (hostelSlug: string) => {
  const access = await authorizeHostelManager(hostelSlug);
  if (access.ok) return { hostelId: access.hostel._id };
  if (access.status === 401) return { error: "Unauthorized" as const };
  if (access.status === 404) return { error: "Hostel not found" as const };

  // Listed staff keep access even when their account lacks a hostel staff role.
  const session = await getHostelSession();
  if (!session?.user) return { error: "Unauthorized" as const };
  await dbConnect();
  const hostel = await HostelModel.findOne({ slug: hostelSlug })
    .select("_id warden administrators")
    .lean<HostelLean>();
  if (!hostel) return { error: "Hostel not found" as const };
  if (!isListedStaff(session.user, hostel)) {
    return { error: "Forbidden Access" as const };
  }
  return { hostelId: hostel._id };
});

export async function getWardenDashboardStats(
  hostelSlug: string
): Promise<ActionResult<DashboardStats>> {
  return runAction("Failed to load dashboard stats", async () => {
    const access = await authorizeHostel(hostelSlug);
    if ("error" in access) {
      throw new UserFacingError(access.error ?? "Unauthorized");
    }

    const hostelId = access.hostelId;
    const [pendingCount, activeCount, studentCount, bannedCount] =
      await Promise.all([
        OutPassModel.countDocuments({ hostel: hostelId, status: "pending" }),
        OutPassModel.countDocuments({ hostel: hostelId, status: "in_use" }),
        HostelStudentModel.countDocuments({ hostelId }),
        HostelStudentModel.countDocuments({ hostelId, banned: true }),
      ]);

    return {
      pendingOutpasses: pendingCount,
      activeOutpasses: activeCount,
      totalStudents: studentCount,
      bannedStudents: bannedCount,
    };
  });
}

/** Oldest pending requests first, so the queue is worked in order. */
export async function getPendingOutpasses(
  hostelSlug: string,
  page = 1,
  limit = 20
): Promise<ActionResult<PendingOutpass[]>> {
  return runAction("Failed to fetch requests", async () => {
    const access = await authorizeHostel(hostelSlug);
    if ("error" in access) {
      throw new UserFacingError(access.error ?? "Unauthorized");
    }

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

    return serialize<PendingOutpass[]>(requests);
  });
}
