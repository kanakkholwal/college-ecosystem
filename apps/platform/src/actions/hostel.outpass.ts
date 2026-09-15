"use server";

import { format } from "date-fns";
import type mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import type z from "zod";
import { ROLES_ENUMS } from "~/constants";
import { REASONS, requestOutPassSchema } from "~/constants/hostel.outpass";
import { isObjectIdString } from "~/constants/hostel_n_outpass";
import {
  type ActionResult,
  fail,
  runAction,
  UserFacingError,
} from "~/lib/action-result";
import dbConnect from "~/lib/dbConnect";
import {
  authorizeGate,
  authorizeHostelManager,
  authorizeResident,
  getHostelSession,
  HOSTEL_STAFF_ROLES,
  hasRole,
  isCampusWide,
  isListedStaff,
} from "~/lib/hostel-access";
import {
  HostelStudentModel,
  OPEN_OUTPASS_STATUSES,
  OutPassModel,
  type OutPassType,
} from "~/models/hostel_n_outpass";
import { serialize } from "~/utils/serialize";

const OPEN_PASS_MESSAGE =
  "You already have a request waiting for review or a pass in use";
const SOMETHING_WENT_WRONG = "Something went wrong";

const STUDENT_FIELDS = "_id name email rollNumber";
const HOSTEL_FIELDS = "_id name slug gender";

const endOfDay = (date: Date, addDays = 0) => {
  const d = new Date(date);
  d.setDate(d.getDate() + addDays);
  d.setHours(23, 59, 59, 999);
  return d;
};

export async function createOutPass(
  data: z.infer<typeof requestOutPassSchema>
): Promise<ActionResult<string>> {
  const validationResponse = requestOutPassSchema.safeParse(data);
  if (!validationResponse.success) {
    return fail(
      validationResponse.error.issues[0]?.message ?? "Invalid request"
    );
  }
  const input = validationResponse.data;
  return runAction(
    SOMETHING_WENT_WRONG,
    async () => {
      const access = await authorizeResident();
      if (!access.ok) throw new UserFacingError(access.error);
      const { hosteler, hostel } = access;

      const now = new Date();
      if (
        hosteler.banned &&
        (!hosteler.bannedTill || hosteler.bannedTill > now)
      ) {
        throw new UserFacingError(
          `You can't request outpasses until ${hosteler.bannedTill ? format(new Date(hosteler.bannedTill), "dd/MM/yyyy HH:mm") : "the warden lifts the ban"}`
        );
      }
      if (!REASONS.includes(input.reason)) {
        throw new UserFacingError("Invalid Reason");
      }

      const open = await OutPassModel.exists({
        student: hosteler._id,
        status: { $in: [...OPEN_OUTPASS_STATUSES] },
      });
      if (open) throw new UserFacingError(OPEN_PASS_MESSAGE);

      if (
        input.roomNumber !== hosteler.roomNumber &&
        input.roomNumber !== "UNKNOWN"
      ) {
        await HostelStudentModel.updateOne(
          { _id: hosteler._id },
          { roomNumber: input.roomNumber }
        );
      }

      // Home and medical passes stay valid four days past the return date; the rest end that day.
      const returnDate = new Date(input.expectedInTime);
      const validTill =
        input.reason === "home" || input.reason === "medical"
          ? endOfDay(returnDate, 4)
          : endOfDay(returnDate);

      await OutPassModel.create({
        student: hosteler._id,
        hostel: hostel._id,
        rollNumber: hosteler.rollNumber,
        roomNumber: input.roomNumber,
        address: input.address,
        reason: input.reason,
        expectedInTime: input.expectedInTime,
        expectedOutTime: input.expectedOutTime,
        status: "pending",
        validTill,
      });

      return "Outpass Requested Successfully";
    },
    { duplicate: OPEN_PASS_MESSAGE }
  );
}

export async function getOutPassForHosteler(): Promise<
  ActionResult<OutPassType[]>
> {
  return runAction(SOMETHING_WENT_WRONG, async () => {
    const access = await authorizeResident();
    if (!access.ok) throw new UserFacingError(access.error);
    const outPasses = await OutPassModel.find({ student: access.hosteler._id })
      .populate("hostel", HOSTEL_FIELDS)
      .populate("student", STUDENT_FIELDS)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return serialize<OutPassType[]>(outPasses);
  });
}

/** Gate staff and campus-wide roles only. */
export async function getOutPassHistoryByRollNo(
  rollNo: string
): Promise<ActionResult<OutPassType[]>> {
  return runAction(SOMETHING_WENT_WRONG, async () => {
    const session = await getHostelSession();
    if (
      !session?.user ||
      !(
        hasRole(session.user, [ROLES_ENUMS.GUARD]) || isCampusWide(session.user)
      )
    ) {
      throw new UserFacingError("Unauthorized");
    }
    await dbConnect();
    const roll = rollNo.trim();
    const student = await HostelStudentModel.findOne({
      rollNumber: { $in: [roll, roll.toLowerCase(), roll.toUpperCase()] },
    })
      .select("_id")
      .lean<{ _id: mongoose.Types.ObjectId }>();
    if (!student) return [];
    const outPasses = await OutPassModel.find({ student: student._id })
      .populate("student", STUDENT_FIELDS)
      .populate("hostel", HOSTEL_FIELDS)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return serialize<OutPassType[]>(outPasses);
  });
}

/** Visible to the student it belongs to, that hostel's staff, gate staff and campus-wide roles. */
export async function getOutPassById(
  id: string
): Promise<ActionResult<OutPassType | null>> {
  return runAction(SOMETHING_WENT_WRONG, async () => {
    const session = await getHostelSession();
    if (!session?.user) throw new UserFacingError("Unauthorized");
    if (!isObjectIdString(id)) return null;
    await dbConnect();
    const outPass = await OutPassModel.findById(id)
      .populate("hostel", `${HOSTEL_FIELDS} warden administrators`)
      .populate("student", STUDENT_FIELDS)
      .lean<
        OutPassType & {
          hostel: Parameters<typeof isListedStaff>[1] & { _id: unknown };
        }
      >();
    if (!outPass) return null;

    const user = session.user;
    const email = user.email.trim().toLowerCase();
    const allowed =
      outPass.student?.email?.toLowerCase() === email ||
      isCampusWide(user) ||
      hasRole(user, [ROLES_ENUMS.GUARD]) ||
      (hasRole(user, HOSTEL_STAFF_ROLES) &&
        !!outPass.hostel &&
        isListedStaff(user, outPass.hostel));
    if (!allowed) return null;

    const { warden, administrators, ...hostel } = outPass.hostel;
    return serialize<OutPassType>({ ...outPass, hostel });
  });
}

const describeGateState = (status?: string) => {
  switch (status) {
    case "pending":
      return "This outpass is still waiting for the warden's approval.";
    case "rejected":
      return "This outpass was rejected by the warden.";
    case "processed":
      return "This outpass has already been used.";
    default:
      return "This outpass can't be used right now.";
  }
};

/** Atomic approved -> in_use -> processed, so a double scan never logs twice or steps back. */
export async function allowEntryExit(
  id: string,
  action_type: "entry" | "exit"
): Promise<ActionResult<string>> {
  return runAction("Couldn't update the outpass. Try again.", async () => {
    const access = await authorizeGate();
    if (!access.ok) throw new UserFacingError(access.error);
    if (!isObjectIdString(id)) throw new UserFacingError("Outpass not found");
    if (action_type !== "entry" && action_type !== "exit") {
      throw new UserFacingError("Invalid action type provided.");
    }
    await dbConnect();
    const now = new Date();
    const loggedBy = access.session.user.id;

    if (action_type === "exit") {
      const updated = await OutPassModel.findOneAndUpdate(
        {
          _id: id,
          status: "approved",
          actualOutTime: null,
          expectedInTime: { $gt: now },
        },
        {
          $set: {
            status: "in_use",
            actualOutTime: now,
            exitLoggedBy: loggedBy,
          },
        },
        { new: true }
      ).lean();
      if (updated) return "Exit logged.";

      const current = await OutPassModel.findById(id)
        .select("status expectedInTime")
        .lean<{ status: string; expectedInTime: Date }>();
      if (!current) throw new UserFacingError("Outpass not found");
      if (current.status === "in_use") return "Exit was already logged.";
      if (current.status === "approved") {
        throw new UserFacingError("This outpass has expired.");
      }
      throw new UserFacingError(describeGateState(current.status));
    }

    const updated = await OutPassModel.findOneAndUpdate(
      { _id: id, status: "in_use", actualInTime: null },
      {
        $set: {
          status: "processed",
          actualInTime: now,
          entryLoggedBy: loggedBy,
        },
      },
      { new: true }
    ).lean();
    if (updated) return "Return logged.";

    const current = await OutPassModel.findById(id)
      .select("status")
      .lean<{ status: string }>();
    if (!current) throw new UserFacingError("Outpass not found");
    if (current.status === "processed") return "Return was already logged.";
    if (current.status === "approved") {
      throw new UserFacingError("Log the exit before the return.");
    }
    throw new UserFacingError(describeGateState(current.status));
  });
}

/** Hostel staff decide once while pending; a repeat is a no-op, the opposite is refused. */
export async function approveRejectOutPass(
  id: string,
  action: "approve" | "reject",
  reason?: string
): Promise<ActionResult<string>> {
  if (!isObjectIdString(id)) return fail("Outpass not found");
  if (action !== "approve" && action !== "reject") {
    return fail("Invalid action type");
  }
  const rejectionReason = reason?.trim().slice(0, 500) ?? "";
  if (action === "reject" && rejectionReason.length < 3) {
    return fail("Add a reason so the student knows what to fix");
  }
  return runAction("Couldn't update the request. Try again.", async () => {
    await dbConnect();
    const target = await OutPassModel.findById(id)
      .select("hostel status")
      .lean<{ hostel: mongoose.Types.ObjectId; status: string }>();
    if (!target) throw new UserFacingError("Outpass not found");

    const access = await authorizeHostelManager(target.hostel.toString(), "id");
    if (!access.ok) throw new UserFacingError(access.error);

    const nextStatus = action === "approve" ? "approved" : "rejected";
    const updated = await OutPassModel.findOneAndUpdate(
      { _id: id, hostel: access.hostel._id, status: "pending" },
      {
        $set: {
          status: nextStatus,
          reviewedBy: access.session.user.id,
          reviewedAt: new Date(),
          rejectionReason: action === "reject" ? rejectionReason : null,
        },
      },
      { new: true }
    ).lean();

    revalidatePath("/[moderator]/h/[slug]/outpass-requests", "page");
    if (updated) {
      return action === "approve" ? "Outpass approved" : "Outpass rejected";
    }

    const current = await OutPassModel.findById(id)
      .select("status")
      .lean<{ status: string }>();
    if (current?.status === nextStatus) {
      return action === "approve"
        ? "Outpass was already approved"
        : "Outpass was already rejected";
    }
    throw new UserFacingError(
      `Someone already ${current?.status === "rejected" ? "rejected" : "approved"} this request`
    );
  });
}

export type OutpassQueueItem = {
  _id: string;
  reason: OutPassType["reason"];
  address: string;
  roomNumber: string;
  expectedOutTime: string;
  expectedInTime: string;
  createdAt: string;
  student: { _id: string; name: string; rollNumber: string } | null;
};

export type OutpassStatusCounts = Record<OutPassType["status"], number>;

/** Pending requests oldest first, plus a count for every status. */
export async function getOutpassQueue(
  slug: string,
  limit = 50
): Promise<
  ActionResult<{ pending: OutpassQueueItem[]; counts: OutpassStatusCounts }>
> {
  return runAction("Failed to load requests", async () => {
    const access = await authorizeHostelManager(slug);
    if (!access.ok) throw new UserFacingError(access.error);
    const hostelId = access.hostel._id;
    const [pending, grouped] = await Promise.all([
      OutPassModel.find({ hostel: hostelId, status: "pending" })
        .select(
          "reason address roomNumber expectedOutTime expectedInTime createdAt student"
        )
        .populate("student", "name rollNumber")
        .sort({ createdAt: 1 })
        .limit(Math.min(Math.max(1, limit), 100))
        .lean(),
      OutPassModel.aggregate<{ _id: OutPassType["status"]; count: number }>([
        { $match: { hostel: hostelId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);
    const counts: OutpassStatusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      in_use: 0,
      processed: 0,
    };
    for (const g of grouped) {
      if (g._id in counts) counts[g._id] = g.count;
    }
    return { pending: serialize<OutpassQueueItem[]>(pending), counts };
  });
}

export type OutpassLogRow = {
  _id: string;
  status: OutPassType["status"];
  reason: OutPassType["reason"];
  roomNumber: string;
  expectedOutTime: string;
  expectedInTime: string;
  actualOutTime: string | null;
  actualInTime: string | null;
  createdAt: string;
  updatedAt: string;
  student: { _id: string; name: string; rollNumber: string } | null;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function getOutPassHistoryForHostel({
  slug,
  query,
  status,
  page = 1,
  limit = 50,
  sortBy = "desc",
}: {
  slug: string;
  query?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: "asc" | "desc";
}): Promise<ActionResult<{ rows: OutpassLogRow[]; total: number }>> {
  return runAction("Failed to load outpass logs", async () => {
    const access = await authorizeHostelManager(slug);
    if (!access.ok) throw new UserFacingError(access.error);
    const hostelId = access.hostel._id;
    const filter: Record<string, unknown> = { hostel: hostelId };
    if (status && status !== "all") filter.status = status;

    const term = query?.trim();
    if (term) {
      const pattern = new RegExp(escapeRegex(term), "i");
      const students = await HostelStudentModel.find({
        hostelId,
        $or: [{ name: pattern }, { rollNumber: pattern }],
      })
        .select("_id")
        .limit(500)
        .lean<{ _id: mongoose.Types.ObjectId }[]>();
      filter.student = { $in: students.map((s) => s._id) };
    }

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const [rows, total] = await Promise.all([
      OutPassModel.find(filter)
        .select(
          "status reason roomNumber expectedOutTime expectedInTime actualOutTime actualInTime createdAt updatedAt student"
        )
        .populate("student", "name rollNumber")
        .sort({ createdAt: sortBy === "asc" ? 1 : -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      OutPassModel.countDocuments(filter),
    ]);
    return { rows: serialize<OutpassLogRow[]>(rows), total };
  });
}

type HostelerProfile = {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
  roomNumber: string;
};

/** One resident's outpasses, for staff of the hostel that resident belongs to. */
export async function getOutPassByIdForHosteler(
  studentId: string,
  slug?: string
): Promise<
  ActionResult<{ outpasses: OutPassType[]; student: HostelerProfile }>
> {
  if (!isObjectIdString(studentId)) return fail("Student not found");
  return runAction(SOMETHING_WENT_WRONG, async () => {
    await dbConnect();
    const student = await HostelStudentModel.findById(studentId)
      .select("_id name rollNumber email roomNumber hostelId")
      .lean<{
        _id: mongoose.Types.ObjectId;
        name: string;
        rollNumber: string;
        email: string;
        roomNumber: string;
        hostelId: mongoose.Types.ObjectId | null;
      }>();
    if (!student?.hostelId) throw new UserFacingError("Student not found");
    const access = await authorizeHostelManager(
      student.hostelId.toString(),
      "id"
    );
    if (!access.ok) throw new UserFacingError(access.error);
    if (slug && access.hostel.slug !== slug) {
      throw new UserFacingError("Student not found");
    }

    const outPasses = await OutPassModel.find({ student: student._id })
      .populate("hostel", HOSTEL_FIELDS)
      .populate("student", STUDENT_FIELDS)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const { hostelId, ...profile } = student;
    return {
      outpasses: serialize<OutPassType[]>(outPasses),
      student: serialize<HostelerProfile>(profile),
    };
  });
}
