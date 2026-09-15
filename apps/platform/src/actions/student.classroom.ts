"use server";
import type { rawClassRoomType } from "~/constants/student.classroom";
import { type ActionResult, runAction } from "~/lib/action-result";
import dbConnect from "~/lib/dbConnect";
import { ClassRoomModel } from "~/models/classroom";
import { serialize } from "~/utils/serialize";

export async function createClassroom(
  classroom: rawClassRoomType
): Promise<ActionResult<unknown>> {
  return runAction("Error creating classroom", async () => {
    await dbConnect();
    const newClassRoom = new ClassRoomModel(classroom);
    const savedClassRoom = await newClassRoom.save();
    return serialize<unknown>(savedClassRoom);
  });
}
