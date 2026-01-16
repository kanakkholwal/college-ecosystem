"use server";
import { rawClassRoomType } from "~/constants/student.classroom";
import dbConnect from "~/lib/dbConnect";
import { ClassRoomModel } from "~/models/classroom";

export async function createClassroom(classroom: rawClassRoomType) {
  try {
    await dbConnect();
    const newClassRoom = new ClassRoomModel(classroom);
    const savedClassRoom = await newClassRoom.save();
    return JSON.parse(JSON.stringify(savedClassRoom));
  } catch (error) {
    console.error("Error creating classroom:", error);
    throw new Error("Error creating classroom");
  }
}
