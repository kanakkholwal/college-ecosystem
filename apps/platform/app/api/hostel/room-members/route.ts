import type mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { isObjectIdString } from "~/constants/hostel_n_outpass";
import dbConnect from "~/lib/dbConnect";
import { authorizeHostelManager, authorizeResident } from "~/lib/hostel-access";
import { HostelRoomModel, RoomMemberModel } from "~/models/allotment";

type Member = {
  _id: mongoose.Types.ObjectId;
  name: string;
  rollNumber: string;
};

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId");
  if (!roomId || !isObjectIdString(roomId)) {
    return NextResponse.json(
      { message: "No room id provided" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const room = await HostelRoomModel.findById(roomId)
      .select("roomNumber capacity occupied_seats isLocked hostel hostStudent")
      .lean<{
        roomNumber: string;
        capacity: number;
        occupied_seats: number;
        isLocked: boolean;
        hostel: mongoose.Types.ObjectId;
        hostStudent?: mongoose.Types.ObjectId;
      }>();
    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    const manager = await authorizeHostelManager(room.hostel.toString(), "id");
    if (!manager.ok) {
      const resident = await authorizeResident();
      if (!resident.ok || !resident.hostel._id.equals(room.hostel)) {
        return NextResponse.json(
          { message: "Forbidden" },
          { status: manager.status === 401 ? 401 : 403 }
        );
      }
    }

    const members = await RoomMemberModel.find({ room: roomId })
      .populate("student", "name rollNumber")
      .lean<{ student: Member | null }[]>();
    const hostId = room.hostStudent?.toString();
    const list = members.flatMap(({ student }) => (student ? [student] : []));
    const host = list.find((m) => m._id.toString() === hostId);

    return NextResponse.json(
      {
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        occupied_seats: room.occupied_seats,
        isLocked: room.isLocked,
        hostStudent: host
          ? { name: host.name, rollNumber: host.rollNumber }
          : null,
        members: list.map((m) => ({
          name: m.name,
          rollNumber: m.rollNumber,
          isHost: m._id.toString() === hostId,
        })),
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("room-members failed:", error);
    return NextResponse.json(
      { message: "Failed to load room members" },
      { status: 500 }
    );
  }
}
