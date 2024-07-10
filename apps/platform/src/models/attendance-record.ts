import mongoose, { Schema, Types } from "mongoose";
import * as z from "zod";

export const rawAttendanceRecordSchema = z.object({
  subjectCode: z.string(),
  subjectName: z.string(),
  totalClasses: z.coerce.number().nonnegative(),
});

export type RawAttendanceRecord = z.infer<typeof rawAttendanceRecordSchema>;

export interface IAttendanceRecord extends RawAttendanceRecord {
  userId: Types.ObjectId;
  attendance: {
    date: Date;
    isPresent: boolean;
  }[];
}
export interface AttendanceRecordWithId extends IAttendanceRecord {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectCode: { type: String, required: true, trim: true, lowercase: true },
    subjectName: { type: String, required: true, trim: true, lowercase: true },
    totalClasses: { type: Number, required: true },
    attendance: [
      {
        date: { type: Date, required: true },
        isPresent: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: true }
);
attendanceRecordSchema.index(
  { userId: 1, subjectCode: 1, subjectName: 1 },
  { unique: true }
);

export default mongoose.models?.AttendanceRecord ||
  mongoose.model<IAttendanceRecord>("AttendanceRecord", attendanceRecordSchema);
