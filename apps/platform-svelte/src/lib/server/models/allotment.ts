import mongoose, { Schema, type Document } from "mongoose";

// Hostel Rooms Schema
export interface RawHostelRoomType {
  roomNumber: string;
  capacity: number;
  occupied_seats: number;
  isLocked: boolean;
}

export interface IHostelRoom extends Document, RawHostelRoomType {
  hostel: mongoose.Types.ObjectId;
  hostStudent?: mongoose.Types.ObjectId;
}
export interface HostelRoomJson extends RawHostelRoomType {
  hostel: string;
  hostStudent?:
    | string
    | {
        name: string;
        rollNumber: string;
        email: string;
      };
  _id: string;
}

const HostelRoomSchema = new Schema<IHostelRoom>({
  roomNumber: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1, max: 7 },
  occupied_seats: { type: Number, default: 0 },
  hostStudent: { type: Schema.Types.ObjectId, ref: "HostelStudent" },
  isLocked: { type: Boolean, default: false },
  hostel: {
    type: Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
});

export const HostelRoomModel =
  mongoose?.models?.HostelRoom ||
  mongoose.model<IHostelRoom>("HostelRoom", HostelRoomSchema);

// Room Members Schema
export interface IRoomMember extends Document {
  student: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  hostel: mongoose.Types.ObjectId;
}

const RoomMemberSchema = new Schema<IRoomMember>({
  student: {
    type: Schema.Types.ObjectId,
    ref: "HostelStudent",
    required: true,
  },
  room: { type: Schema.Types.ObjectId, ref: "HostelRoom", required: true },

  hostel: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
});

export const RoomMemberModel =
  mongoose?.models?.RoomMember ||
  mongoose.model<IRoomMember>("RoomMember", RoomMemberSchema);

// Allotment Slots Schema
export interface IAllotmentSlot extends Document {
  slot_number: number;
  startingTime: Date;
  endingTime: Date;
  allotedFor: string[];
  hostelId: mongoose.Types.ObjectId;
}

const AllotmentSlotSchema = new Schema<IAllotmentSlot>({
  startingTime: { type: Date, required: true },
  endingTime: { type: Date, required: true },
  allotedFor: { type: [String], required: true },
  hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true },
});

export const AllotmentSlotModel =
  mongoose?.models?.AllotmentSlot ||
  mongoose.model<IAllotmentSlot>("AllotmentSlot", AllotmentSlotSchema);
