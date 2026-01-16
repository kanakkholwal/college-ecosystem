"use server";

import mongoose from "mongoose";
import z from "zod";
import { getStudentsByHostelId } from "~/actions/hostel.core";
import {
  SLOT_CAPACITY,
  SLOT_DURATION,
  SLOT_TIME_GAP,
} from "~/constants/hostel.allotment-process";
import dbConnect from "~/lib/dbConnect";
import redis from "~/lib/redis";
import {
  AllotmentSlotModel,
  HostelRoomModel,
  RoomMemberModel
} from "~/models/allotment";
import { HostelModel, HostelStudentModel } from "~/models/hostel_n_outpass";

// ==========================================
// 🔒 LOCKING MECHANISM (CRITICAL FOR FREE TIER)
// ==========================================

async function acquireLock(roomId: string, ttlSeconds = 5): Promise<boolean> {
  const key = `lock:room:${roomId}`;
  // NX: Set only if Not Exists, EX: Expire after N seconds
  const result = await redis.set(key, "locked",  "EX", ttlSeconds);
  return result === "OK";
}

async function releaseLock(roomId: string) {
  const key = `lock:room:${roomId}`;
  await redis.del(key);
}

// ==========================================
// 🛠 PROCESS MANAGEMENT
// ==========================================

const allotmentProcessSchema = z.object({
  status: z.enum(["open", "closed", "paused", "waiting", "completed"]),
  hostelId: z.string(),
});

export async function getAllotmentProcess(hostelId: string) {
  const allotmentProcess = await redis.get(`allotment-process-${hostelId}`);
  if (!allotmentProcess) {
    const payload = { status: "waiting", hostelId };
    await redis.set(`allotment-process-${hostelId}`, JSON.stringify(payload));
    return payload;
  }
  return JSON.parse(allotmentProcess as string);
}

export async function updateAllotmentProcess(
  hostelId: string,
  payload: z.infer<typeof allotmentProcessSchema>
) {
  const validatedPayload = allotmentProcessSchema.safeParse(payload);
  if (!validatedPayload.success) {
    return { error: true, message: "Invalid payload", data: validatedPayload.error.format() };
  }
  await redis.set(`allotment-process-${hostelId}`, JSON.stringify(validatedPayload.data));
  return { error: false, message: "Allotment process updated", data: validatedPayload.data };
}

export async function startAllotment(hostelId: string) {
  return updateAllotmentProcess(hostelId, { status: "open", hostelId });
}

export async function pauseAllotment(hostelId: string) {
  return updateAllotmentProcess(hostelId, { status: "paused", hostelId });
}

export async function closeAllotment(hostelId: string) {
  return updateAllotmentProcess(hostelId, { status: "closed", hostelId });
}

// ==========================================
// ⏳ SLOT MANAGEMENT (OPTIMIZED)
// ==========================================

export async function distributeSlots(hostelId: string) {
  try {
    await dbConnect();
    const hostelStudents = await getStudentsByHostelId(hostelId);
    if (!hostelStudents) return { error: true, message: "Hostel Not Found", data: null };

    // Batch Processing to prevent timeout
    const allotmentSlotsData = [];
    const currentTime = new Date();
    // Round to next clean 30 min block
    currentTime.setMinutes(Math.ceil(currentTime.getMinutes() / 30) * 30);
    
    let currentSlotStart = new Date(currentTime);
    const totalDuration = SLOT_DURATION + SLOT_TIME_GAP;

    for (let i = 0; i < hostelStudents.length; i += SLOT_CAPACITY) {
      const batch = hostelStudents.slice(i, i + SLOT_CAPACITY);
      
      const endTime = new Date(currentSlotStart);
      endTime.setMinutes(currentSlotStart.getMinutes() + SLOT_DURATION);

      allotmentSlotsData.push({
        startingTime: new Date(currentSlotStart),
        endingTime: endTime,
        allotedFor: batch.map((student) => student.email),
        hostelId,
      });

      // Increment start time for next batch
      currentSlotStart.setMinutes(currentSlotStart.getMinutes() + totalDuration);
    }

    // 🚀 SINGLE WRITE OPERATION (Much faster than loop)
    await AllotmentSlotModel.deleteMany({ hostelId }); // Clear old slots first? Optional.
    const createdSlots = await AllotmentSlotModel.insertMany(allotmentSlotsData);

    return {
      error: false,
      message: `Successfully created ${createdSlots.length} slots`,
      data: JSON.parse(JSON.stringify(createdSlots)),
    };
  } catch (error) {
    console.error(error);
    return { error: true, message: "Internal Server Error", data: null };
  }
}

export async function getUpcomingSlots(hostelId: string) {
  try {
    await dbConnect();
    const upcomingSlots = await AllotmentSlotModel.find({
      hostelId,
      startingTime: { $gte: new Date() },
    }).sort({ startingTime: 1 });

    return { error: false, message: "Slots fetched", data: JSON.parse(JSON.stringify(upcomingSlots)) };
  } catch (err) {
    return { error: true, message: "Internal Server Error", data: [] };
  }
}

// ==========================================
// 🏠 ROOM MANAGEMENT
// ==========================================

const hostelRoomSchema = z.object({
  roomNumber: z.string(),
  capacity: z.number().min(1).max(7),
  occupied_seats: z.number().default(0),
  hostStudent: z.string().nullable(),
  isLocked: z.boolean().default(false),
  hostel: z.string(),
});
const roomsSchema = z.array(hostelRoomSchema);

export async function addHostelRooms(hostelId: string, rooms: z.infer<typeof roomsSchema>) {
  const validatedPayload = roomsSchema.safeParse(rooms);
  if (!validatedPayload.success) {
    return { error: true, message: "Invalid payload", data: validatedPayload.error.format() };
  }
  
  try {
    await dbConnect();
    const hostel = await HostelModel.findById(hostelId);
    if (!hostel) return { error: true, message: "Hostel Not Found", data: null };

    await HostelRoomModel.insertMany(validatedPayload.data);
    return { error: false, message: "Rooms added successfully", data: null };
  } catch (error) {
    return { error: true, message: "Internal Server Error", data: null };
  }
}

export async function getHostelRooms(hostelId: string) {
  try {
    await dbConnect();
    const rooms = await HostelRoomModel.aggregate([
      { $match: { hostel: new mongoose.Types.ObjectId(hostelId) } },
      {
        $addFields: {
          numericRoomNumber: {
            $toInt: {
              $arrayElemAt: [{ $split: [{ $replaceAll: { input: "$roomNumber", find: "G-", replacement: "" } }, "-"] }, 0],
            },
          },
        },
      },
      { $sort: { numericRoomNumber: 1 } },
      { $project: { numericRoomNumber: 0 } },
    ]);

    return { error: false, message: "Rooms fetched", data: JSON.parse(JSON.stringify(rooms)) };
  } catch (error) {
    return { error: true, message: "Internal Server Error", data: [] };
  }
}

// ==========================================
// ☢️ CRITICAL TRANSACTIONAL ACTIONS
// ==========================================

export async function joinRoom(roomId: string, joinerId: string) {
  const session = await mongoose.startSession();
  
  // 1. ACQUIRE REDIS LOCK
  const hasLock = await acquireLock(roomId);
  if (!hasLock) {
    session.endSession();
    return { error: true, message: "Room is currently busy. Please try again in 3 seconds.", data: null };
  }

  try {
    session.startTransaction();
    await dbConnect();

    // 2. FETCH DATA WITH SESSION
    const room = await HostelRoomModel.findById(roomId).session(session);
    const joinerStudent = await HostelStudentModel.findById(joinerId).session(session);

    if (!room || !joinerStudent) throw new Error("Room or Student not found");
    if (room.isLocked) throw new Error("Room is Locked by Admin");

    // 3. CHECK FOR EXISTING MEMBERSHIP
    const existingMember = await RoomMemberModel.findOne({ student: joinerId, room: roomId }).session(session);
    if (existingMember) throw new Error("You are already in this room");

    // 4. CAPACITY & KICK LOGIC
    if (room.occupied_seats >= room.capacity) {
      // Fetch all current members to find the weakest link
      const members = await RoomMemberModel.find({ room: roomId }).populate('student').session(session);
      
      // Sort: Ascending CGPA (lowest first)
      // Note: Assuming 'cgpi' is the field. Handle nulls safely.
      members.sort((a, b) => ((a.student as any).cgpi || 0) - ((b.student as any).cgpi || 0));
      
      const weakestMember = members[0];
      const weakestStudent = weakestMember.student as any;

      if ((joinerStudent.cgpi || 0) > (weakestStudent.cgpi || 0)) {
        // ⚡ KICK ACTION
        await RoomMemberModel.findByIdAndDelete(weakestMember._id).session(session);
        
        // Return kicked student to allotment pool
        await AllotmentSlotModel.updateMany(
           { hostelId: room.hostel, startingTime: { $gte: new Date() } },
           { $push: { allotedFor: weakestStudent.email } }
        ).session(session);

        // Decrement temporarily so logic below proceeds correctly
        room.occupied_seats -= 1; 

        // If kicked student was host, unset host temporarily
        if (room.hostStudent?.toString() === weakestStudent._id.toString()) {
           room.hostStudent = null;
        }
      } else {
        throw new Error("Room is full and your CGPA is insufficient to displace existing members.");
      }
    }

    // 5. DETERMINE HOST (Priority Logic)
    let isNewHost = false;
    
    if (!room.hostStudent) {
      room.hostStudent = joinerStudent._id;
      isNewHost = true;
    } else {
      const currentHost = await HostelStudentModel.findById(room.hostStudent).session(session);
      if (currentHost && (joinerStudent.cgpi || 0) > (currentHost.cgpi || 0)) {
        room.hostStudent = joinerStudent._id;
        isNewHost = true;
      }
    }

    // 6. EXECUTE JOIN
    room.occupied_seats += 1;
    await room.save({ session });

    await RoomMemberModel.create([{
      student: joinerStudent._id,
      room: roomId,
      hostel: room.hostel
    }], { session });

    // 7. REMOVE FROM ALLOTMENT SLOTS
    await AllotmentSlotModel.updateMany(
      { hostelId: room.hostel, startingTime: { $gte: new Date() } },
      { $pull: { allotedFor: joinerStudent.email } }
    ).session(session);

    await session.commitTransaction();
    
    return {
      error: false,
      message: isNewHost ? "Joined room and promoted to Host!" : "Joined room successfully",
      data: null,
    };

  } catch (err: any) {
    await session.abortTransaction();
    console.error("Join Error:", err);
    return { error: true, message: err.message || "Server Error", data: null };
  } finally {
    session.endSession();
    await releaseLock(roomId); // ALWAYS RELEASE LOCK
  }
}

export async function addRoomMembers(roomId: string, hostId: string, members: string[]) {
  const session = await mongoose.startSession();
  const hasLock = await acquireLock(roomId);

  if (!hasLock) {
    session.endSession();
    return { error: true, message: "Room is busy.", data: null };
  }

  try {
    session.startTransaction();
    await dbConnect();

    const room = await HostelRoomModel.findById(roomId).session(session);
    if (!room) throw new Error("Room not found");
    if (room.hostStudent?.toString() !== hostId) throw new Error("Only the Room Host can add members");

    const uniqueMembers = [...new Set(members.map((m) => m.toLowerCase()))];
    
    // STRICT CAPACITY CHECK
    if (room.occupied_seats + uniqueMembers.length > room.capacity) {
      throw new Error("Adding these members would exceed room capacity");
    }

    // Validate Students
    const studentsToAdd = [];
    for (const email of uniqueMembers) {
      const student = await HostelStudentModel.findOne({ email }).session(session);
      if (!student) throw new Error(`Student with email ${email} not found`);
      
      // Check if already in a room
      const inRoom = await RoomMemberModel.exists({ student: student._id });
      if (inRoom) throw new Error(`${student.name} is already in a room`);
      
      studentsToAdd.push(student);
    }

    // Insert Members
    const memberDocs = studentsToAdd.map(s => ({
      student: s._id,
      room: roomId,
      hostel: room.hostel
    }));
    
    await RoomMemberModel.insertMany(memberDocs, { session });

    // Update Room
    room.occupied_seats += studentsToAdd.length;
    await room.save({ session });

    // Clear Slots for all added members
    const emails = studentsToAdd.map(s => s.email);
    await AllotmentSlotModel.updateMany(
      { hostelId: room.hostel, startingTime: { $gte: new Date() } },
      { $pull: { allotedFor: { $in: emails } } }
    ).session(session);

    await session.commitTransaction();
    return { error: false, message: "Members added successfully", data: null };

  } catch (err: any) {
    await session.abortTransaction();
    return { error: true, message: err.message, data: null };
  } finally {
    session.endSession();
    await releaseLock(roomId);
  }
}

// ==========================================
// 🛠 UTILITY READS
// ==========================================

export async function lockToggleRoom(roomId: string) {
  try {
    await dbConnect();
    const room = await HostelRoomModel.findById(roomId);
    if (!room) return { error: true, message: "Room Not Found", data: null };
    
    room.isLocked = !room.isLocked;
    await room.save();
    return { error: false, message: "Lock updated", data: JSON.parse(JSON.stringify(room)) };
  } catch (err) {
    return { error: true, message: "Internal Server Error", data: null };
  }
}

export async function getHostRoom(hostId: string) {
  await dbConnect();
  const room = await HostelRoomModel.findOne({ hostStudent: hostId });
  if (!room) return { error: true, message: "Room Not Found", data: { room: null, member: null } };
  
  const roomMember = await RoomMemberModel.find({ room: room._id, student: hostId });
  
  return {
    error: false,
    message: "Fetched",
    data: { room: JSON.parse(JSON.stringify(room)), member: JSON.parse(JSON.stringify(roomMember)) },
  };
}