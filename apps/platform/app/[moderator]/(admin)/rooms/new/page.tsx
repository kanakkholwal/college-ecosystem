import type { Metadata } from "next";
import { createRoom } from "~/actions/common.room";
import CreateRoomForm from "./form";

export const metadata: Metadata = {
  title: "New Room | Dashboard",
  description: "Add a new room to the database",
};

export default function CoursesPage() {
  return <CreateRoomForm onSubmit={createRoom} />
}
