import RoomCard, {
  RoomCardSkeleton,
} from "@/components/application/room/card";
import SearchBox from "@/components/application/room/search";
import { RoomFloor } from "@/components/illustrations/room-floor";
import { TiltedChip } from "@/components/site/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { SearchX, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { listAllRoomsWithHistory } from "~/actions/common.room";
import { getSession } from "~/auth/server";

type SearchParams = { query?: string; currentStatus?: string };

export const metadata: Metadata = {
  title: "Classroom Finder",
  description: "See which classrooms, labs and halls are free right now.",
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
    "Free Classrooms",
    "NITH Free Rooms",
  ],
};

const STATUSES = new Set(["available", "occupied"]);

export default async function RoomsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await props.searchParams;
  const query = params.query?.trim() || "";
  const status = STATUSES.has(params.currentStatus ?? "")
    ? params.currentStatus
    : undefined;

  return (
    <div className="@container mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pb-12 md:px-6">
      <header className="grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex flex-col items-start">
          <TiltedChip>
            <span className="text-primary">Classrooms</span>, labs and halls
          </TiltedChip>
          <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
            Find a free
            <br />
            <span className="text-primary">classroom</span>
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">
            Class representatives and faculty mark rooms as they use them, so
            check when a room was last updated before you walk over.
          </p>
          <div className="mt-8 w-full rounded-3xl border border-border bg-card/85 p-2 backdrop-blur-xl dark:bg-background/85">
            <Suspense fallback={<Skeleton className="h-14 w-full rounded-2xl" />}>
              <SearchBox />
            </Suspense>
          </div>
        </div>
        <RoomFloor className="mx-auto hidden max-w-sm lg:block" />
      </header>

      <ErrorBoundaryWithSuspense
        key={`${query}|${status ?? ""}`}
        fallback={
          <StateCard
            icon={<TriangleAlert className="size-6" aria-hidden="true" />}
            title="Rooms couldn't load"
            description="The room service didn't respond. Refresh the page, or try again in a minute."
          />
        }
        loadingFallback={<RoomsSkeleton />}
      >
        <RoomList query={query} status={status} />
      </ErrorBoundaryWithSuspense>
    </div>
  );
}

async function RoomList({
  query,
  status,
}: {
  query: string;
  status?: string;
}) {
  const [rooms, session] = await Promise.all([
    listAllRoomsWithHistory({ status, roomNumber: query }),
    getSession(),
  ]);

  if (rooms.length === 0) {
    return (
      <StateCard
        icon={<SearchX className="size-6" aria-hidden="true" />}
        title="No rooms match"
        description="Check the room number, or clear the status filter."
      />
    );
  }

  const free = rooms.filter((r) => r.currentStatus === "available").length;
  const sorted = [...rooms].sort((a, b) =>
    a.roomNumber.localeCompare(b.roomNumber, "en", { numeric: true })
  );
  const user = session?.user
    ? {
        id: session.user.id,
        role: session.user.role,
        other_roles: session.user.other_roles,
      }
    : undefined;

  return (
    <section aria-labelledby="rooms-count" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
        <h2
          id="rooms-count"
          className="text-body-lg font-medium text-foreground"
        >
          {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
        </h2>
        <p className="text-caption text-muted-foreground tabular-nums">
          {free} available, {rooms.length - free} occupied
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
        {sorted.map((room) => (
          <li key={room.id}>
            <RoomCard room={room} user={user} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RoomsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between border-b border-border pb-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <RoomCardSkeleton key={`room-skeleton-${i.toString()}`} />
        ))}
      </div>
    </div>
  );
}

function StateCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-xl border border-border bg-card text-foreground dark:bg-background">
        {icon}
      </span>
      <h2 className="mt-4 text-body-lg font-medium text-foreground">{title}</h2>
      <p className="mt-1 text-body text-muted-foreground">{description}</p>
    </div>
  );
}
