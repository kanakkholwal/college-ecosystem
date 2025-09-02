import RoomCard from "@/components/application/room-card";
import SearchBox from "@/components/application/room-search";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { Plus } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import { changeCase } from "~/utils/string";

import { BaseHeroSection } from "@/components/application/base-hero";
import { ResponsiveContainer } from "@/components/common/container";
import { HeaderBar } from "@/components/common/header-bar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/utils/link";
import { MdRoom } from "react-icons/md";
import { getRoomsInfo, listAllRoomsWithHistory } from "~/actions/common.room";
import { headers } from "next/headers";
import { auth } from "~/auth";

type Props = {
  params: Promise<{
    moderator: string;
  }>;
  searchParams?: Promise<{
    query?: string;
    page?: string;
    currentStatus?: string;
    roomType?: string;
  }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `Rooms | ${changeCase(params.moderator, "title")} Dashboard `,
    description: "Search for rooms based on their availability and type.",
  };
}

export default async function RoomsPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const moderator = params.moderator;
  const query = searchParams?.query || "";
  const status = searchParams?.currentStatus || "";

  const rooms = await listAllRoomsWithHistory({
    status,
    roomNumber: query,
  });
  const { totalRooms, totalAvailableRooms, totalOccupiedRooms } =
    await getRoomsInfo();

  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const stats = [
    {
      label: "Total Rooms",
      value: totalRooms,
    },
    {
      label: "Available Rooms",
      value: totalAvailableRooms,
    },
    {
      label: "Occupied Rooms",
      value: totalOccupiedRooms,
    },
  ];
  return (
    <div className="w-full space-y-6">
      <HeaderBar
        Icon={MdRoom}
        titleNode={
          <>
            Manage Rooms <Badge size="sm">{rooms.length} found</Badge>
          </>
        }
        descriptionNode="Here you can create new rooms or view existing ones."
        actionNode={
          <ButtonLink
            variant="dark"
            size="sm"
            effect="shineHover"
            href={`/admin/rooms/new`}
          >
            <Plus />
            New Room
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4 px-4">
        {stats.map((item, index) => (
          <div className="bg-card border p-4 rounded-lg" key={index}>
            <h3 className="text-sm font-medium">{item.label}</h3>
            <h4 className="text-primary font-semibold tracking-wide text-3xl mt-4">
              {item.value}
            </h4>
          </div>
        ))}
      </div>

      <BaseHeroSection
        title={
          <>
            Rooms <span className="text-primary">Search</span>
          </>
        }
        description="Search for rooms based on their availability and type."
      >
        <SearchBox />
      </BaseHeroSection>
      <ResponsiveContainer className="mb-32 max-w-[144rem] @md:grid-cols-1 @lg:grid-cols-2  @3xl:grid-cols-4 @7xl:grid-cols-5">
        <ErrorBoundaryWithSuspense
          key="Rooms"
          fallback={
            <h4 className="text-red-500 text-lg">
              {" "}
              Error fetching rooms. Please try again later.{" "}
            </h4>
          }
          loadingFallback={Array.from({ length: 8 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Skeleton className="h-12 w-full" key={`loading-${index}`} />
          ))}
        >
          {rooms.map((room) => {
            return (
              <RoomCard
                key={room.id}
                room={room}
                user={session?.user}
                deletable
              />
            );
          })}
        </ErrorBoundaryWithSuspense>
      </ResponsiveContainer>
    </div>
  );
}
