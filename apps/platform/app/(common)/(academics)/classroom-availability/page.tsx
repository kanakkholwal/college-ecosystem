import RoomCard from "@/components/application/room/card";
import SearchBox from "@/components/application/room/search";
import { ResponsiveContainer } from "@/components/common/container";
import EmptyArea from "@/components/common/empty-area";
import { NoteSeparator } from "@/components/common/note-separator";
import { Skeleton } from "@/components/ui/skeleton";
import ConditionalRender from "@/components/utils/conditional-render";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import { listAllRoomsWithHistory } from "~/actions/common.room";

import { BaseHeroSection } from "@/components/application/base-hero";
import { Suspense } from "react";
import { getSession } from "~/auth/server";

type Props = {
  searchParams: Promise<{
    query?: string;
    currentStatus?: string;
  }>;
};

export const metadata: Metadata = {
  title: `Rooms`,
  description: "Search for rooms based on their availability and type.",
  alternates: {
    canonical: "/classroom-availability",
  },
  keywords: [
    "NITH",
    "Rooms",
    "Room Search",
    "NITH Room Search",
    "Classroom Availability",
    "NITH Classroom Availability",
    "Room Booking",
    "NITH Room Booking",
    "Room Management",
    "NITH Room Management",
  ],
};

export default async function RoomsPage(props: Props) {
  const searchParams = await props.searchParams;
  const session = await getSession();

  const rooms = await listAllRoomsWithHistory({
    status: searchParams.currentStatus,
    roomNumber: searchParams.query,
  });

  return (
    <div className="px-3 md:px-6 xl:px-12 @container">
      <BaseHeroSection
        title={
          <>
            Rooms <span className="text-primary">Search</span>
          </>
        }
        description="Search for rooms based on their availability and type."
      >
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <SearchBox />
        </Suspense>
      </BaseHeroSection>

      <NoteSeparator label={`${rooms.length} Rooms found`} />
      <ErrorBoundaryWithSuspense
        loadingFallback={
          <ResponsiveContainer>
            {[...Array(8)].map((_, i) => (
              <Skeleton
                className="w-full h-96"
                key={`skeleton-${i.toString()}`}
              />
            ))}
          </ResponsiveContainer>
        }
      >
        <ConditionalRender condition={rooms.length === 0}>
          <EmptyArea
            icons={[Search]}
            title="No rooms found"
            description="Try adjusting your search filters."
          />
        </ConditionalRender>
        <ConditionalRender condition={rooms.length > 0}>
          <ResponsiveContainer className="px-0">
            {rooms.map((room, i) => {
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  user={session?.user}
                  style={{
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              );
            })}
          </ResponsiveContainer>
        </ConditionalRender>
      </ErrorBoundaryWithSuspense>
    </div>
  );
}
