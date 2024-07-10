import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";
import dbConnect from "src/lib/dbConnect";
import RoomModel, { RoomType, RoomTypeWithId } from "src/models/room";
import CreateRoomForm from "./form";

export const metadata: Metadata = {
  title: "New Room | Dashboard",
  description: "Add a new room to the database",
};

export default async function CoursesPage() {
  await dbConnect();

  async function SaveRoom(room: RoomType): Promise<RoomTypeWithId> {
    "use server";
    await dbConnect();
    console.log(room);
    try {
      const newRoom = new RoomModel(room);
      await newRoom.save();
      return Promise.resolve(JSON.parse(JSON.stringify(newRoom)));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  return (
    <>
      <Card className="m-4 mt-10">
        <CardHeader>
          <CardTitle>New Room</CardTitle>
          <CardDescription>Add a new room</CardDescription>
        </CardHeader>
        <CreateRoomForm onSubmit={SaveRoom} />
      </Card>
    </>
  );
}
