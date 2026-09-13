import { EmptyNote } from "@/components/application/dashboard/primitives";
import RoomCard, { RoomCardSkeleton } from "@/components/application/room/card";
import SearchBox from "@/components/application/room/search";
import {
  KpiCard,
  KpiGrid,
  KpiGridSkeleton,
} from "@/components/application/stats-card";
import { HeaderBar } from "@/components/common/header-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { DoorOpen, Plus, SearchX, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getRoomsInfo, listAllRoomsWithHistory } from "~/actions/common.room";
import { getSession } from "~/auth/server";
import { roomTypes } from "~/constants/common.room";
import { canToggleRooms, isAdmin } from "../access";

export const metadata: Metadata = {
  title: "Rooms",
  description: "Mark rooms free or occupied and manage the room list.",
};

type Props = {
  params: Promise<{ moderator: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const STATUSES = new Set(["available", "occupied"]);
const TYPES = new Set<string>(roomTypes);

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

export default async function RoomsPage(props: Props) {
  const [{ moderator }, sp, session] = await Promise.all([
    props.params,
    props.searchParams,
    getSession(),
  ]);
  const query = first(sp.query);
  const status = STATUSES.has(first(sp.currentStatus))
    ? first(sp.currentStatus)
    : undefined;
  const roomType = TYPES.has(first(sp.roomType))
    ? first(sp.roomType)
    : undefined;
  const admin = isAdmin(session?.user) && moderator === "admin";
  const user = session?.user
    ? {
        id: session.user.id,
        role: session.user.role,
        other_roles: session.user.other_roles,
      }
    : undefined;

  return (
    <div className="@container flex flex-col gap-8">
      <HeaderBar
        Icon={DoorOpen}
        titleNode="Rooms"
        descriptionNode={
          canToggleRooms(session?.user)
            ? "Flip a room's switch when a class starts or ends. The classroom finder updates straight away."
            : "Live room status. Only admins, faculty and CRs can change it."
        }
        actionNode={
          admin && (
            <ButtonLink href="/admin/rooms/new" variant="primary">
              <Plus />
              New room
            </ButtonLink>
          )
        }
      />

      <ErrorBoundaryWithSuspense
        fallback={null}
        loadingFallback={<KpiGridSkeleton count={3} />}
      >
        <RoomTotals />
      </ErrorBoundaryWithSuspense>

      <Suspense fallback={<Skeleton className="h-14 w-full rounded-2xl" />}>
        <SearchBox roomTypes={roomTypes} />
      </Suspense>

      <ErrorBoundaryWithSuspense
        key={`${query}|${status ?? ""}|${roomType ?? ""}`}
        fallback={
          <EmptyNote
            icon={<TriangleAlert />}
            title="Rooms couldn't load"
            description="The room service didn't respond. Refresh the page to try again."
          />
        }
        loadingFallback={<RoomsSkeleton />}
      >
        <RoomList
          moderator={moderator}
          query={query}
          status={status}
          roomType={roomType}
          user={user}
          canDelete={admin}
        />
      </ErrorBoundaryWithSuspense>
    </div>
  );
}

async function RoomTotals() {
  const stats = await getRoomsInfo();
  return (
    <KpiGrid label="Room totals" className="@4xl:grid-cols-3">
      <KpiCard
        label="Rooms"
        value={stats.totalRooms}
        hint="Every room on the list"
      />
      <KpiCard
        label="Available"
        value={stats.totalAvailableRooms}
        hint="Marked free by their last update"
      />
      <KpiCard
        label="Occupied"
        value={stats.totalOccupiedRooms}
        hint="Marked in use by their last update"
      />
    </KpiGrid>
  );
}

async function RoomList({
  moderator,
  query,
  status,
  roomType,
  user,
  canDelete,
}: {
  moderator: string;
  query: string;
  status?: string;
  roomType?: string;
  user?: React.ComponentProps<typeof RoomCard>["user"];
  canDelete: boolean;
}) {
  const rooms = await listAllRoomsWithHistory({
    status,
    roomType,
    roomNumber: query,
  });
  const filtered = Boolean(query || status || roomType);

  if (rooms.length === 0) {
    return (
      <EmptyNote
        icon={<SearchX />}
        title={filtered ? "No rooms match" : "No rooms yet"}
        description={
          filtered
            ? "Check the room number, or clear a filter."
            : "Rooms appear here once an admin adds them."
        }
        action={
          filtered && (
            <ButtonLink
              href={`/${moderator}/rooms`}
              variant="outline"
              size="sm"
            >
              Clear search
            </ButtonLink>
          )
        }
      />
    );
  }

  const free = rooms.filter((r) => r.currentStatus === "available").length;
  const sorted = [...rooms].sort((a, b) =>
    a.roomNumber.localeCompare(b.roomNumber, "en", { numeric: true })
  );

  return (
    <section aria-labelledby="rooms-count" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
        <h2
          id="rooms-count"
          className="text-body-lg font-medium tabular-nums text-foreground"
        >
          {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
        </h2>
        <p className="text-caption tabular-nums text-muted-foreground">
          {free} available, {rooms.length - free} occupied
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3">
        {sorted.map((room) => (
          <li key={room.id}>
            <RoomCard room={room} user={user} deletable={canDelete} />
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
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <RoomCardSkeleton key={`room-skeleton-${i.toString()}`} />
        ))}
      </div>
    </div>
  );
}
