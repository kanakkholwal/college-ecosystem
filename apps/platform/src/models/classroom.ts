import mongoose, { Schema } from "mongoose";
import { rawClassRoomType } from "~/constants/student.classroom";

export interface IClassRoomType extends Document, rawClassRoomType {}

export interface ClassRoomTypeJSON extends rawClassRoomType {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const classRoomSchema = new Schema<IClassRoomType>(
  {
    className: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: String, required: true },
    students: [
      {
        name: { type: String, required: true },
        rollNo: { type: String, required: true },
        role: { type: String, enum: ["student", "cr"], default: "student" },
      },
    ],
    classTeacher: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String },
    },
    classRep: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const ClassRoomModel =
  mongoose.models?.ClassRoom ||
  mongoose.model<IClassRoomType>("ClassRoom", classRoomSchema);
