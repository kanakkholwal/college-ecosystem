"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import z from "zod";
import {
  ALLOTMENT_STATUSES,
  type AllotmentStatus,
  SLOT_CAPACITY,
  SLOT_DURATION,
  SLOT_TIME_GAP,
} from "~/constants/hostel.allotment-process";
import dbConnect from "~/lib/dbConnect";
import {
  authorizeHostelManager,
  authorizeResident,
  type HostelerLean,
} from "~/lib/hostel-access";
import { redisGet, redisSet } from "~/lib/redis";
import {
  AllotmentSlotModel,
  type HostelRoomJson,
  HostelRoomModel,
  RoomMemberModel,
} from "~/models/allotment";
import { HostelStudentModel } from "~/models/hostel_n_outpass";
import { orgConfig } from "~/project.config";

const serialize = <T>(value: unknown): T => JSON.parse(JSON.stringify(value));

type Result<T> = { error: boolean; message: string; data: T };

const fail = <T>(message: string, data: T): Result<T> => ({
  error: true,
  message,
  data,
});

// --- Process state ---


const allotmentProcessSchema = z.object({
  status: z.enum(ALLOTMENT_STATUSES),
  hostelId: z.string(),
});
type AllotmentProcess = z.infer<typeof allotmentProcessSchema>;

const processKey = (hostelId: string) => `allotment-process-${hostelId}`;

// Redis being down reads as "waiting", so nobody can pick rooms while state is unknown.
async function readProcess(hostelId: string): Promise<AllotmentProcess> {
  const stored = await redisGet<AllotmentProcess>(processKey(hostelId));
  const parsed = allotmentProcessSchema.safeParse(stored);
  return parsed.success ? parsed.data : { status: "waiting", hostelId };
}

export async function getAllotmentProcess(
  hostelId: string
): Promise<AllotmentProcess> {
  const manager = await authorizeHostelManager(hostelId, "id");
  if (!manager.ok) {
    const resident = await authorizeResident();
    if (!resident.ok || !resident.hostel._id.equals(hostelId)) {
      return Promise.reject("Unauthorized");
    }
  }
  return readProcess(hostelId);
}

export async function updateAllotmentProcess(
  hostelId: string,
  payload: AllotmentProcess
): Promise<Result<AllotmentProcess | null>> {
  const access = await authorizeHostelManager(hostelId, "id");
  if (!access.ok) return fail(access.error, null);
  const parsed = allotmentProcessSchema.safeParse({ ...payload, hostelId });
  if (!parsed.success) return fail("Invalid payload", null);
  const saved = await redisSet(processKey(hostelId), parsed.data);
  if (!saved) return fail("Couldn't save the status. Try again.", null);
  revalidatePath("/[moderator]/h/[slug]/allotment", "page");
  return { error: false, message: "Allotment status updated", data: parsed.data };
}

// --- Slots ---

export async function distributeSlots(
  hostelId: string
): Promise<Result<{ slots: number; students: number } | null>> {
  const access = await authorizeHostelManager(hostelId, "id");
  if (!access.ok) return fail(access.error, null);
  try {
    // Highest CGPI picks first.
    const students = await HostelStudentModel.find({ hostelId })
      .select("email")
      .sort({ cgpi: -1, rollNumber: 1 })
      .lean<{ email: string }[]>();
    if (students.length === 0) {
      return fail("Import residents before generating slots", null);
    }

    const start = new Date();
    start.setSeconds(0, 0);
    start.setMinutes(Math.ceil(start.getMinutes() / 30) * 30);
    const step = (SLOT_DURATION + SLOT_TIME_GAP) * 60_000;

    const slots = [];
    for (let i = 0; i < students.length; i += SLOT_CAPACITY) {
      const startingTime = new Date(
        start.getTime() + (i / SLOT_CAPACITY) * step
      );
      slots.push({
        startingTime,
        endingTime: new Date(startingTime.getTime() + SLOT_DURATION * 60_000),
        allotedFor: students.slice(i, i + SLOT_CAPACITY).map((s) => s.email),
        hostelId: access.hostel._id,
      });
    }

    await AllotmentSlotModel.deleteMany({ hostelId: access.hostel._id });
    await AllotmentSlotModel.insertMany(slots);
    revalidatePath("/[moderator]/h/[slug]/allotment", "page");
    return {
      error: false,
      message: `Created ${slots.length} slots for ${students.length} residents`,
      data: { slots: slots.length, students: students.length },
    };
  } catch (error) {
    console.error(error);
    return fail("Couldn't generate slots", null);
  }
}

export type SlotSummary = {
  _id: string;
  startingTime: string;
  endingTime: string;
  students: number;
};

export async function getUpcomingSlots(
  hostelId: string
): Promise<Result<SlotSummary[]>> {
  const access = await authorizeHostelManager(hostelId, "id");
  if (!access.ok) return fail(access.error, []);
  try {
    const slots = await AllotmentSlotModel.find({ hostelId })
      .select("startingTime endingTime allotedFor")
      .sort({ startingTime: 1 })
      .lean<
        {
          _id: mongoose.Types.ObjectId;
          startingTime: Date;
          endingTime: Date;
          allotedFor: string[];
        }[]
      >();
    return {
      error: false,
      message: "Slots fetched",
      data: slots.map((s) => ({
        _id: s._id.toString(),
        startingTime: s.startingTime.toISOString(),
        endingTime: s.endingTime.toISOString(),
        students: s.allotedFor.length,
      })),
    };
  } catch {
    return fail("Couldn't load slots", []);
  }
}

// --- Rooms ---

const importRoomSchema = z.object({
  roomNumber: z.string().trim().min(1).max(20),
  capacity: z.number().int().min(1).max(7),
});

export type RoomImportRow = { roomNumber: string; capacity: number };

export async function addHostelRooms(
  hostelId: string,
  rooms: RoomImportRow[]
): Promise<
  Result<{ added: number; skipped: { roomNumber: string; reason: string }[] } | null>
> {
  const access = await authorizeHostelManager(hostelId, "id");
  if (!access.ok) return fail(access.error, null);
  const parsed = z.array(importRoomSchema).max(2000).safeParse(rooms);
  if (!parsed.success || parsed.data.length === 0) {
    return fail("Every row needs a room number and a capacity from 1 to 7", null);
  }

  try {
    const hostel = access.hostel._id;
    const existing = await HostelRoomModel.find({
      hostel,
      roomNumber: { $in: parsed.data.map((r) => r.roomNumber) },
    })
      .select("roomNumber")
      .lean<{ roomNumber: string }[]>();
    const taken = new Set(existing.map((r) => r.roomNumber));
    const seen = new Set<string>();
    const skipped: { roomNumber: string; reason: string }[] = [];
    const fresh = parsed.data.filter((room) => {
      if (taken.has(room.roomNumber)) {
        skipped.push({ roomNumber: room.roomNumber, reason: "Already exists" });
        return false;
      }
      if (seen.has(room.roomNumber)) {
        skipped.push({ roomNumber: room.roomNumber, reason: "Repeated in file" });
        return false;
      }
      seen.add(room.roomNumber);
      return true;
    });

    if (fresh.length) {
      await HostelRoomModel.insertMany(
        fresh.map((room) => ({
          ...room,
          hostel,
          occupied_seats: 0,
          isLocked: false,
        }))
      );
    }
    revalidatePath("/[moderator]/h/[slug]/rooms", "page");
    return {
      error: false,
      message: `Added ${fresh.length} rooms`,
      data: { added: fresh.length, skipped },
    };
  } catch (error) {
    console.error(error);
    return fail("Couldn't add rooms", null);
  }
}

async function listRooms(hostelId: mongoose.Types.ObjectId) {
  const rooms = await HostelRoomModel.find({ hostel: hostelId })
    .select("roomNumber capacity occupied_seats isLocked hostel hostStudent")
    .lean();
  const collator = new Intl.Collator("en", { numeric: true });
  return serialize<HostelRoomJson[]>(rooms).sort((a, b) =>
    collator.compare(a.roomNumber, b.roomNumber)
  );
}

/** Staff of the hostel, or a resident of it. */
export async function getHostelRooms(
  hostelId: string
): Promise<Result<HostelRoomJson[]>> {
  const manager = await authorizeHostelManager(hostelId, "id");
  let id = manager.ok ? manager.hostel._id : null;
  if (!id) {
    const resident = await authorizeResident();
    if (resident.ok && resident.hostel._id.equals(hostelId)) {
      id = resident.hostel._id;
    }
  }
  if (!id) return fail("Unauthorized", []);
  try {
    return { error: false, message: "Rooms fetched", data: await listRooms(id) };
  } catch {
    return fail("Couldn't load rooms", []);
  }
}

export async function lockToggleRoom(
  roomId: string
): Promise<Result<HostelRoomJson | null>> {
  if (!mongoose.isValidObjectId(roomId)) return fail("Room Not Found", null);
  try {
    await dbConnect();
    const room = await HostelRoomModel.findById(roomId)
      .select("hostel isLocked")
      .lean<{ hostel: mongoose.Types.ObjectId; isLocked: boolean }>();
    if (!room) return fail("Room Not Found", null);
    const access = await authorizeHostelManager(room.hostel.toString(), "id");
    if (!access.ok) return fail(access.error, null);

    const updated = await HostelRoomModel.findOneAndUpdate(
      { _id: roomId, hostel: room.hostel },
      [{ $set: { isLocked: { $not: "$isLocked" } } }],
      { new: true }
    ).lean();
    revalidatePath("/[moderator]/h/[slug]/rooms", "page");
    return {
      error: false,
      message: updated?.isLocked ? "Room locked" : "Room unlocked",
      data: serialize(updated),
    };
  } catch {
    return fail("Couldn't change the lock", null);
  }
}

// --- Student room selection ---

export type MyAllotment = {
  process: AllotmentStatus;
  hosteler: { _id: string; name: string; rollNumber: string; cgpi: number };
  hostel: { _id: string; name: string; slug: string };
  slot: { startingTime: string; endingTime: string } | null;
  hasSlots: boolean;
  eligible: boolean;
  reason: string | null;
  room: {
    _id: string;
    roomNumber: string;
    capacity: number;
    occupied: number;
    isHost: boolean;
    members: { name: string; rollNumber: string; isHost: boolean; isYou: boolean }[];
  } | null;
};

async function slotFor(hostelId: mongoose.Types.ObjectId, email: string) {
  const [slot, hasSlots] = await Promise.all([
    AllotmentSlotModel.findOne({ hostelId, allotedFor: email })
      .select("startingTime endingTime")
      .sort({ startingTime: 1 })
      .lean<{ startingTime: Date; endingTime: Date }>(),
    AllotmentSlotModel.exists({ hostelId }),
  ]);
  return { slot, hasSlots: !!hasSlots };
}

function eligibility(
  status: AllotmentStatus,
  slot: { startingTime: Date } | null,
  hasSlots: boolean,
  now = new Date()
) {
  if (status !== "open") return "Room selection isn't open";
  if (!hasSlots) return null;
  if (!slot) return "You aren't in any selection slot";
  if (slot.startingTime > now) return "Your slot hasn't started yet";
  return null;
}

async function roomOf(hosteler: HostelerLean) {
  const membership = await RoomMemberModel.findOne({ student: hosteler._id })
    .select("room")
    .lean<{ room: mongoose.Types.ObjectId }>();
  if (!membership) return null;
  const [room, members] = await Promise.all([
    HostelRoomModel.findById(membership.room)
      .select("roomNumber capacity occupied_seats hostStudent")
      .lean<{
        _id: mongoose.Types.ObjectId;
        roomNumber: string;
        capacity: number;
        occupied_seats: number;
        hostStudent?: mongoose.Types.ObjectId;
      }>(),
    RoomMemberModel.find({ room: membership.room })
      .populate("student", "name rollNumber")
      .lean<{ student: { _id: mongoose.Types.ObjectId; name: string; rollNumber: string } | null }[]>(),
  ]);
  if (!room) return null;
  const hostId = room.hostStudent?.toString();
  return {
    _id: room._id.toString(),
    roomNumber: room.roomNumber,
    capacity: room.capacity,
    occupied: room.occupied_seats,
    isHost: hostId === hosteler._id.toString(),
    members: members.flatMap(({ student }) =>
      student
        ? [
            {
              name: student.name,
              rollNumber: student.rollNumber,
              isHost: student._id.toString() === hostId,
              isYou: student._id.equals(hosteler._id),
            },
          ]
        : []
    ),
  };
}

/** Everything the student's room selection page needs, derived from the session. */
export async function getMyAllotment(): Promise<Result<MyAllotment | null>> {
  const access = await authorizeResident();
  if (!access.ok) return fail(access.error, null);
  const { hosteler, hostel } = access;
  try {
    const [process, { slot, hasSlots }, room] = await Promise.all([
      readProcess(hostel._id.toString()),
      slotFor(hostel._id, hosteler.email),
      roomOf(hosteler),
    ]);
    const reason = room
      ? null
      : eligibility(process.status, slot, hasSlots);
    return {
      error: false,
      message: "Fetched",
      data: {
        process: process.status,
        hosteler: {
          _id: hosteler._id.toString(),
          name: hosteler.name,
          rollNumber: hosteler.rollNumber,
          cgpi: hosteler.cgpi ?? 0,
        },
        hostel: {
          _id: hostel._id.toString(),
          name: hostel.name,
          slug: hostel.slug,
        },
        slot: slot
          ? {
              startingTime: slot.startingTime.toISOString(),
              endingTime: slot.endingTime.toISOString(),
            }
          : null,
        hasSlots,
        eligible: !room && reason === null,
        reason,
        room,
      },
    };
  } catch (err) {
    console.error("getMyAllotment failed", err);
    return fail("Couldn't load your allotment", null);
  }
}

/**
 * Joins as the signed-in resident; `joinerId` is ignored and kept only for older callers.
 * Runs in a transaction so concurrent joins on one room conflict instead of overbooking.
 */
export async function joinRoom(
  roomId: string,
  _joinerId?: string
): Promise<Result<null>> {
  const access = await authorizeResident();
  if (!access.ok) return fail(access.error, null);
  const { hosteler, hostel } = access;
  if (!mongoose.isValidObjectId(roomId)) return fail("Room not found", null);
  if (hosteler.banned) return fail("Banned residents can't pick rooms", null);

  const [process, { slot, hasSlots }] = await Promise.all([
    readProcess(hostel._id.toString()),
    slotFor(hostel._id, hosteler.email),
  ]);
  const blocked = eligibility(process.status, slot, hasSlots);
  if (blocked) return fail(blocked, null);

  await dbConnect();
  const session = await mongoose.startSession();
  try {
    let message = "Joined room";
    await session.withTransaction(async () => {
      const room = await HostelRoomModel.findOne({
        _id: roomId,
        hostel: hostel._id,
      }).session(session);
      if (!room) throw new Error("Room not found");
      if (room.isLocked) throw new Error("This room is locked by the warden");

      const already = await RoomMemberModel.exists({
        student: hosteler._id,
      }).session(session);
      if (already) throw new Error("You already have a room");

      if (room.occupied_seats >= room.capacity) {
        const members = await RoomMemberModel.find({ room: room._id })
          .populate("student", "cgpi email")
          .session(session);
        members.sort(
          (a, b) =>
            ((a.student as { cgpi?: number })?.cgpi ?? 0) -
            ((b.student as { cgpi?: number })?.cgpi ?? 0)
        );
        const weakest = members[0];
        const weakestStudent = weakest?.student as
          | { _id: mongoose.Types.ObjectId; cgpi?: number; email: string }
          | undefined;
        if (!weakestStudent || (hosteler.cgpi ?? 0) <= (weakestStudent.cgpi ?? 0)) {
          throw new Error(
            "This room is full and every member has an equal or higher CGPI"
          );
        }
        await RoomMemberModel.deleteOne({ _id: weakest._id }).session(session);
        // The displaced resident goes back into the next open slot.
        await AllotmentSlotModel.findOneAndUpdate(
          { hostelId: hostel._id, endingTime: { $gte: new Date() } },
          { $addToSet: { allotedFor: weakestStudent.email } },
          { sort: { startingTime: 1 } }
        ).session(session);
        room.occupied_seats -= 1;
        if (room.hostStudent?.equals(weakestStudent._id)) {
          room.hostStudent = undefined;
        }
      }

      if (!room.hostStudent) {
        room.hostStudent = hosteler._id;
        message = "Joined room as host";
      } else {
        const host = await HostelStudentModel.findById(room.hostStudent)
          .select("cgpi")
          .session(session)
          .lean<{ cgpi?: number }>();
        if ((hosteler.cgpi ?? 0) > (host?.cgpi ?? 0)) {
          room.hostStudent = hosteler._id;
          message = "Joined room and became host";
        }
      }

      room.occupied_seats += 1;
      await room.save({ session });
      await RoomMemberModel.create(
        [{ student: hosteler._id, room: room._id, hostel: hostel._id }],
        { session }
      );
    });
    revalidatePath("/[moderator]/hostel-room-allotment", "page");
    return { error: false, message, data: null };
  } catch (err) {
    const message =
      err instanceof Error && !/WriteConflict|Transaction/i.test(err.message)
        ? err.message
        : "Someone picked this room at the same moment. Try again.";
    return fail(message, null);
  } finally {
    await session.endSession();
  }
}

/** The signed-in host adds roommates by roll number; `hostId` is ignored and kept for older callers. */
export async function addRoomMembers(
  roomId: string,
  _hostId: string | undefined,
  members: string[]
): Promise<Result<null>> {
  const access = await authorizeResident();
  if (!access.ok) return fail(access.error, null);
  const { hosteler, hostel } = access;
  if (!mongoose.isValidObjectId(roomId)) return fail("Room not found", null);

  const process = await readProcess(hostel._id.toString());
  if (process.status !== "open") return fail("Room selection isn't open", null);

  const emails = [
    ...new Set(
      (members ?? [])
        .map((m) => m.trim().toLowerCase())
        .filter(Boolean)
        .map((m) => (m.includes("@") ? m : `${m}@${orgConfig.domain}`))
    ),
  ];
  if (emails.length === 0) return fail("Add at least one roll number", null);

  await dbConnect();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const room = await HostelRoomModel.findOne({
        _id: roomId,
        hostel: hostel._id,
      }).session(session);
      if (!room) throw new Error("Room not found");
      if (room.isLocked) throw new Error("This room is locked by the warden");
      if (!room.hostStudent?.equals(hosteler._id)) {
        throw new Error("Only the room host can add roommates");
      }
      if (room.occupied_seats + emails.length > room.capacity) {
        throw new Error(
          `Only ${room.capacity - room.occupied_seats} seats are left in this room`
        );
      }

      const students = await HostelStudentModel.find({
        email: { $in: emails },
        hostelId: hostel._id,
      })
        .select("_id name email")
        .session(session)
        .lean<{ _id: mongoose.Types.ObjectId; name: string; email: string }[]>();
      const found = new Set(students.map((s) => s.email.toLowerCase()));
      const missing = emails.filter((e) => !found.has(e));
      if (missing.length) {
        throw new Error(
          `Not residents of ${hostel.name}: ${missing.map((e) => e.split("@")[0]).join(", ")}`
        );
      }
      const placed = await RoomMemberModel.find({
        student: { $in: students.map((s) => s._id) },
      })
        .populate("student", "name")
        .session(session)
        .lean<{ student: { name: string } | null }[]>();
      if (placed.length) {
        throw new Error(
          `Already in a room: ${placed.map((p) => p.student?.name ?? "unknown").join(", ")}`
        );
      }

      await RoomMemberModel.insertMany(
        students.map((s) => ({ student: s._id, room: room._id, hostel: hostel._id })),
        { session }
      );
      room.occupied_seats += students.length;
      await room.save({ session });
    });
    revalidatePath("/[moderator]/hostel-room-allotment", "page");
    return { error: false, message: "Roommates added", data: null };
  } catch (err) {
    const message =
      err instanceof Error && !/WriteConflict|Transaction/i.test(err.message)
        ? err.message
        : "The room changed while saving. Try again.";
    return fail(message, null);
  } finally {
    await session.endSession();
  }
}
