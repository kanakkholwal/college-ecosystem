"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "~/auth";
import dbConnect from "~/lib/dbConnect";
import {
  HostelModel,
  HostelStudentModel,
  IHostelType,
  OutPassModel,
} from "~/models/hostel_n_outpass";

// --- Types ---
type DashboardStats = {
  pendingOutpasses: number;
  activeOutpasses: number; // Students currently outside
  totalStudents: number;
  bannedStudents: number;
};

type ActionResponse<T = any> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;

/**
 * 1. GET WARDEN STATS
 * Fetches the counts for the dashboard HUD (Heads-Up Display)
 */
export async function getWardenDashboardStats(
  hostelSlug: string
): ActionResponse<DashboardStats> {
  try {
    await dbConnect();

    // 1. Validate Warden Access
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const hostel = await HostelModel.findOne<IHostelType>({ slug: hostelSlug }).lean();
    if (!hostel) return { success: false, error: "Hostel not found" };

    // Security check: Ensure current user is an admin of this hostel
    const isAuthorized =
      hostel.warden.email === session.user.email ||
      hostel.administrators.some((admin: any) => admin.email === session.user.email) ||
      session.user.role === "admin";

    if (!isAuthorized) return { success: false, error: "Forbidden Access" };

    // 2. Parallel Data Fetching for Performance
    const [pendingCount, activeCount, studentCount, bannedCount] =
      await Promise.all([
        // Count Pending Requests
        OutPassModel.countDocuments({
          hostel: hostel._id,
          status: "pending",
        }),
        // Count Students currently 'in_use' (Outside campus)
        OutPassModel.countDocuments({
          hostel: hostel._id,
          status: "in_use",
        }),
        // Total Students
        HostelStudentModel.countDocuments({
          hostelId: hostel._id,
        }),
        // Disciplinary Cases
        HostelStudentModel.countDocuments({
          hostelId: hostel._id,
          banned: true,
        }),
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
    return {
      success: false, error: "Failed to load dashboard stats",
      data: {
        pendingOutpasses: 0,
        activeOutpasses: 0,
        totalStudents: 0,
        bannedStudents: 0,
      }
    };
  }
}

/**
 * 2. GET PENDING OUTPASSES
 * Fetches list for the "Review Outpasses" page
 */
export async function getPendingOutpasses(
  hostelSlug: string,
  page = 1,
  limit = 20
): ActionResponse {
  try {
    await dbConnect();
    const hostel = await HostelModel.findOne({ slug: hostelSlug }).select("_id");
    if (!hostel) throw new Error("Hostel not found");

    const requests = await OutPassModel.find({
      hostel: hostel._id,
      status: "pending",
    })
      .populate("student", "name rollNumber roomNumber image") // Get student details
      .sort({ createdAt: 1 }) // Oldest first (FIFO queue)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(requests)) };
  } catch (error) {
    return { success: false, error: "Failed to fetch requests" };
  }
}

/**
 * 3. PROCESS OUTPASS (Approve/Reject)
 * The core action for the warden
 */
export async function processOutpassRequest(
  outpassId: string,
  decision: "approved" | "rejected",
  remarks?: string
): ActionResponse {
  try {
    await dbConnect();

    // Auth Check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false, error: "Unauthorized" };

    // Find and Update
    const outpass = await OutPassModel.findById(outpassId);
    if (!outpass) return { success: false, error: "Request not found" };

    if (outpass.status !== "pending") {
      return { success: false, error: "Request already processed" };
    }

    outpass.status = decision;
    // If you had a 'remarks' field in schema, update it here. 
    // Since schema doesn't have it explicitly, we skip saving remarks or add it to schema later.

    await outpass.save();

    // Revalidate the dashboard and requests page
    revalidatePath("/warden/dashboard");
    revalidatePath("/warden/outpass-requests");

    return { success: true, data: { status: decision } };
  } catch (error) {
    return { success: false, error: "Failed to process request" };
  }
}

/**
 * 4. GET STUDENT DIRECTORY
 * For the "Hostelers" page
 */
export async function getHostelResidents(
  hostelSlug: string,
  query?: string
): ActionResponse {
  try {
    await dbConnect();
    const hostel = await HostelModel.findOne({ slug: hostelSlug }).select("_id");

    // Build Search Filter
    const filter: any = { hostelId: hostel._id };
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { rollNumber: { $regex: query, $options: "i" } },
        { roomNumber: { $regex: query, $options: "i" } },
      ];
    }

    const students = await HostelStudentModel.find(filter)
      .sort({ roomNumber: 1 }) // Sort by room
      .limit(50) // Pagination recommended for production
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(students)) };
  } catch (error) {
    return { success: false, error: "Failed to fetch residents" };
  }
}