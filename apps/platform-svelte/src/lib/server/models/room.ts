import mongoose, { Document, Schema } from "mongoose";

export interface RoomType {
  roomNumber: string;
  roomType: string;
  currentStatus: "available" | "occupied";
  lastUpdatedTime: Date;
  capacity?: number;
  usageHistory: HistoryType[]; // Reference to History
}
export interface RoomTypeWithId extends RoomType {
  _id: mongoose.Schema.Types.ObjectId | string;
}
interface IRoom extends Document, RoomType {}

export interface HistoryType {
  user: {
    firstName: string;
    rollNo: string;
    email: string;
  };
  time: Date;
}

const historySchema: Schema = new Schema(
  {
    user: {
      firstName: { type: String, required: true },
      rollNo: { type: String, required: true },
      email: { type: String, required: true },
    },
    time: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

const RoomSchema: Schema = new Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    roomType: {
      type: String,
      required: true,
      enum: ["classroom", "conference", "office", "lab"],
    },
    currentStatus: {
      type: String,
      enum: ["available", "occupied"],
      default: "available",
    },
    lastUpdatedTime: { type: Date, default: Date.now },
    capacity: { type: Number },
    usageHistory: { type: [historySchema] }, // Reference to History model
  },
  {
    timestamps: true,
  }
);

const RoomModel =
  mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);

export default RoomModel;
