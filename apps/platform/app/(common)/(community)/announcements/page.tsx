import EmptyArea from "@/components/common/empty-area";
import Link from "next/link";
import { GrAnnounce } from "react-icons/gr";

import { getAnnouncements } from "~/actions/common.announcement";
import AnnouncementsList from "./list";

import { Badge } from "@/components/ui/badge";
import { Tabs, VercelTabsList } from "@/components/ui/tabs";
import { AuthButtonLink } from "@/components/utils/link";
import { X } from "lucide-react";
import type { Metadata } from "next";
import { Session } from "~/auth";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { RELATED_FOR_TYPES } from "~/constants/common.announcement";
import { changeCase } from "~/utils/string";

export const metadata: Metadata = {
  title: `Announcements`,
  description: "Check the latest announcements here.",
  alternates: {
    canonical: "/announcements",
  },
  keywords: [
    "NITH",
    "Announcements",
    "NITH Announcements",
    "NITH News",
    "NITH Updates",
    "NITH Notifications",
    "NITH Events",
    "NITH College Events",
    "NITH College News",
  ],
};

export default async function AnnouncementsPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  }) as Session;
  const searchParams = await props.searchParams;
  const category = searchParams.category || "all"; // Default to 'all' if no category is provided
  const announcements = await getAnnouncements();
  // console.log(announcements);

  return (
    <div className="w-full max-w-(--max-app-width) grid grid-cols-1 gap-4">
      <Tabs
        defaultValue={category}
        className="md:sticky md:top-4 z-50 mx-1.5 md:mx-auto mt-5"
      >
        <VercelTabsList
          tabs={[
            {
              label: "All",
              id: "all",
            },
            ...RELATED_FOR_TYPES.map((category) => ({
              label: changeCase(category, "camel_to_title"),
              id: category,
            })),
          ]}
          onTabChangeQuery="category"
        />
      </Tabs>
      <div className="md:sticky md:top-4 z-50 mx-1.5 md:mx-auto w-full max-w-2xl flex justify-between items-center gap-2 bg-card px-2 lg:px-4 py-1 lg:py-2 rounded-lg border">
        <h3 className="text-base font-medium">
          Announcements
          {category && (
            <span className="text-sm text-muted-foreground ml-1">
              in {category}
              <Link
                href="/announcements"
                className="ml-1 hover:text-primary cursor-pointer"
              >
                <X className="inline-block size-3" />
              </Link>
            </span>
          )}
          <Badge size="sm" className="ml-2">
            {
              (RELATED_FOR_TYPES.includes(category as any)
                ? announcements.filter(
                    (announcement) => announcement.relatedFor === category
                  )
                : announcements
              ).length
            }
          </Badge>
        </h3>
        <AuthButtonLink
          authorized={!!session?.user}
          variant="ghost"
          size="sm"
          href="/announcements/create"
        >
          Create Announcement
        </AuthButtonLink>
      </div>
      <div className="grid grid-cols-1 gap-4 columns-1 snap-y snap-mandatory px-2 lg:px-4 w-full max-w-2xl mx-auto">
        {announcements.length === 0 ? (
          <EmptyArea
            icons={[GrAnnounce]}
            title="No announcements"
            description="There are no announcements at the moment."
          />
        ) : (
          <AnnouncementsList
            announcements={
              RELATED_FOR_TYPES.includes(category as any)
                ? announcements.filter(
                    (announcement) => announcement.relatedFor === category
                  )
                : announcements
            }
            user={session?.user}
          />
        )}
      </div>
    </div>
  );
}
