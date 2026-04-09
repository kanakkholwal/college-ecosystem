import mongoose, { Schema, type Document } from "mongoose";

// AllotmentLog Schema for tracking real-time activity
interface AllotmentLog extends Document {
  student_id: string; // References student ID (PostgreSQL)
  action: "JOIN_REQUEST" | "JOIN_ACCEPTED" | "JOIN_REJECTED" | "ROOM_LOCKED";
  room_id: string; // References room ID (PostgreSQL)
  timestamp: Date;
  details?: string; // Extra info (who rejected, etc.)
}

const AllotmentLogSchema = new Schema<AllotmentLog>({
  student_id: { type: String, required: true },
  action: {
    type: String,
    enum: ["JOIN_REQUEST", "JOIN_ACCEPTED", "JOIN_REJECTED", "ROOM_LOCKED"],
    required: true,
  },
  room_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
});

// Export AllotmentLog Model
const AllotmentLogModel =
  mongoose.models?.AllotmentLog ||
  mongoose.model<AllotmentLog>("AllotmentLog", AllotmentLogSchema);
export default AllotmentLogModel;
