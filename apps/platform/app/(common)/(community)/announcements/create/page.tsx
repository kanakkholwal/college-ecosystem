import CreateAnnouncement from "./form";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Create Announcement`,
  description: "Create an announcement here",
};

export default function CreateAnnouncementPage() {
  return (
    <>
      <CreateAnnouncement />
    </>
  );
}
