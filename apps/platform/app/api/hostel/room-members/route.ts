import { NextResponse } from "next/server";
import dbConnect from "~/lib/dbConnect";
import { HostelRoomModel, RoomMemberModel } from "~/models/allotment";


type RoomResponse = {
  roomNumber: string;
  capacity: number;
  occupied_seats: number;
  isLocked: boolean;
  hostel: string;
  hostStudent: {
    name: string;
    rollNumber: string;
    email: string;
  };
  members: Array<{
    name: string;
    rollNumber: string;
    email: string;
  }>
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // get room details from query params
    const roomId = searchParams.get("roomId");

    await dbConnect();

    if (!roomId) {
      return NextResponse.json(
        { message: "No room id provided" },
        { status: 400 }
      );
    }

    const room = await HostelRoomModel.findById(roomId).populate(
      "hostStudent",
      "name rollNumber email"
    );

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }
    const roomMembers = await RoomMemberModel.findById(roomId).populate(
      "hostStudent",
      "name rollNumber email"
    );

    const data: RoomResponse = {
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      occupied_seats: room.occupied_seats,
      isLocked: room.isLocked,
      hostel: room.hostel,
      hostStudent: room.hostStudent,
      members: roomMembers.map(
        (member: { name: string; rollNumber: string; email: string }) => ({
          name: member.name,
          rollNumber: member.rollNumber,
          email: member.email,
        })
      ),
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return NextResponse.json(
      {
        message: "Failed to generate Excel file",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
