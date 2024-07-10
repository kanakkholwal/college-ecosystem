import EmptyArea from "@/components/common/empty-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { GrAnnounce } from "react-icons/gr";
// import { getSession } from "src/lib/auth";
// import { sessionType } from "src/types/session";
import { getAnnouncements } from "src/lib/announcement/actions";
import AnnouncementsList from "./list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Announcements | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: `Check the latest announcements here.`,
};

export default async function AnnouncementsPage() {
  // const session = await getSession() as sessionType;
  const announcements = await getAnnouncements();
  console.log(announcements);

  return (
    <>
      <div className="bg-white/20 backdrop-blur-lg mt-5 rounded-lg p-4 @container/polls">
        <div className="w-full flex justify-between items-center whitespace-nowrap gap-2 mb-10">
          <h3 className="text-xl font-semibold">Announcements</h3>
          <Button variant="default_light" size="sm" asChild>
            <Link href="/announcements/create">Create Announcement</Link>
          </Button>
        </div>
        {announcements.length === 0 && (
          <EmptyArea
            Icon={GrAnnounce}
            title="No announcements"
            description="There are no announcements at the moment."
          />
        )}
        <Suspense fallback={<div>Loading...</div>}>
          <AnnouncementsList announcements={announcements} />
        </Suspense>
      </div>
    </>
  );
}
