import { GrAnnounce } from "react-icons/gr";
import CreateAnnouncement from "./form";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Create Announcement | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: "Create an announcement here",
};

export default async function CreateAnnouncementPage() {
  return (
    <>
      <div className="bg-white/20 backdrop-blur-lg mt-5 rounded-lg p-4 @container/polls">
        <div className="w-full flex justify-between items-baseline whitespace-nowrap gap-2">
          <h3 className="text-xl font-semibold">
            <GrAnnounce className="w-6 h-6 mr-2 inline-block" />
            Create Announcement
          </h3>
        </div>
      </div>
      <CreateAnnouncement />
    </>
  );
}
