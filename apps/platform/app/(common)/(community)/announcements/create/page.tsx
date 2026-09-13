import CreateAnnouncement from "@/components/application/announcements/form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New announcement",
  description: "Post an announcement to the campus notice board.",
  robots: { index: false, follow: false },
};

export default function CreateAnnouncementPage() {
  return <CreateAnnouncement />;
}
