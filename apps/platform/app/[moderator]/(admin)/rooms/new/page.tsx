import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, DoorOpen } from "lucide-react";
import type { Metadata } from "next";
import CreateRoomForm from "./form";

export const metadata: Metadata = {
  title: "New room | Admin Dashboard",
  description: "Add a room to the classroom finder.",
};

export default function NewRoomPage() {
  return (
    <div className="@container flex flex-col gap-8">
      <div>
        <ButtonLink
          href="/admin/rooms"
          variant="ghost"
          size="sm"
          className="-ml-3"
        >
          <ArrowLeft aria-hidden="true" />
          All rooms
        </ButtonLink>
      </div>
      <HeaderBar
        Icon={DoorOpen}
        titleNode="New room"
        descriptionNode="Rooms you add appear in the classroom finder, where students check what's free."
      />
      <CreateRoomForm />
    </div>
  );
}
