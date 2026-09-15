import {
  BedDouble,
  CircleCheck,
  FileSpreadsheet,
  Lock,
  SearchX,
} from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  EmptyNote,
  SectionError,
} from "@/components/application/dashboard/primitives";
import {
  StatTile,
  TableFrame,
  Td,
  Th,
} from "@/components/application/hostel/ui";
import { HeaderBar } from "@/components/common/header-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLink } from "@/components/utils/link";
import { getHostelRooms } from "~/actions/hostel.allotment-process";
import { authorizeHostelManager } from "~/lib/hostel-access";
import { ImportRooms, RoomLockButton, RoomSearch } from "./client";

type RawParams = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function RoomsPage({
  params,
  searchParams,
}: {
  params: Promise<{ moderator: string; slug: string }>;
  searchParams: Promise<RawParams>;
}) {
  const [{ moderator, slug }, raw] = await Promise.all([params, searchParams]);
  const access = await authorizeHostelManager(slug);
  if (!access.ok) notFound();
  const hostelId = access.hostel._id.toString();
  const base = `/${moderator}/h/${slug}`;
  const importing = one(raw.view) === "import";
  const filters = {
    query: (one(raw.query) ?? "").trim().toLowerCase(),
    availability: one(raw.availability) ?? null,
    capacity: one(raw.capacity) ?? null,
  };

  return (
    <div className="@container flex flex-col gap-6">
      <HeaderBar
        Icon={BedDouble}
        titleNode="Rooms"
        descriptionNode="Beds, occupancy and locks for every room in this hostel."
        actionNode={
          importing ? (
            <ButtonLink href={`${base}/rooms`} variant="outline">
              Back to rooms
            </ButtonLink>
          ) : (
            <ButtonLink href={`${base}/rooms?view=import`} variant="primary">
              <FileSpreadsheet aria-hidden="true" />
              Import rooms
            </ButtonLink>
          )
        }
      />
      {importing ? (
        <ImportRooms hostelId={hostelId} />
      ) : (
        <Suspense key={JSON.stringify(filters)} fallback={<RoomsSkeleton />}>
          <RoomsTable hostelId={hostelId} base={base} filters={filters} />
        </Suspense>
      )}
    </div>
  );
}

async function RoomsTable({
  hostelId,
  base,
  filters,
}: {
  hostelId: string;
  base: string;
  filters: {
    query: string;
    availability: string | null;
    capacity: string | null;
  };
}) {
  const res = await getHostelRooms(hostelId);
  if (!res.ok) return <SectionError what="Rooms" />;
  const rooms = res.data;

  if (rooms.length === 0) {
    return (
      <EmptyNote
        icon={<BedDouble />}
        title="No rooms yet"
        description="Import a sheet of room numbers and capacities to start tracking beds."
        action={
          <ButtonLink href={`${base}/rooms?view=import`} variant="primary">
            Import rooms
          </ButtonLink>
        }
      />
    );
  }

  const beds = rooms.reduce((a, r) => a + r.capacity, 0);
  const taken = rooms.reduce((a, r) => a + r.occupied_seats, 0);
  const locked = rooms.filter((r) => r.isLocked).length;

  const shown = rooms.filter((r) => {
    if (filters.query && !r.roomNumber.toLowerCase().includes(filters.query)) {
      return false;
    }
    const full = r.occupied_seats >= r.capacity;
    if (filters.availability === "free" && (full || r.isLocked)) return false;
    if (filters.availability === "full" && !full) return false;
    if (filters.availability === "locked" && !r.isLocked) return false;
    if (filters.capacity && String(r.capacity) !== filters.capacity)
      return false;
    return true;
  });

  return (
    <>
      <section
        aria-label="Room totals"
        className="grid grid-cols-2 gap-3 @3xl:grid-cols-4"
      >
        <StatTile label="Rooms" value={rooms.length} />
        <StatTile label="Beds" value={beds} />
        <StatTile label="Free beds" value={Math.max(0, beds - taken)} />
        <StatTile label="Locked rooms" value={locked} />
      </section>
      <RoomSearch />
      {shown.length === 0 ? (
        <EmptyNote
          icon={<SearchX />}
          title="No rooms match"
          action={
            <ButtonLink href="?" variant="outline">
              Clear search and filters
            </ButtonLink>
          }
        />
      ) : (
        <section aria-label="Rooms" className="flex flex-col gap-3">
          <p className="text-body text-muted-foreground" aria-live="polite">
            {shown.length} of {rooms.length} rooms
          </p>
          <TableFrame caption={`${shown.length} rooms`}>
            <thead>
              <tr>
                <Th>Room</Th>
                <Th>Beds taken</Th>
                <Th>Status</Th>
                <Th className="text-right">
                  <span className="sr-only">Lock</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {shown.map((room) => {
                const full = room.occupied_seats >= room.capacity;
                return (
                  <tr key={room._id} className="group/row">
                    <Td className="font-mono font-medium">{room.roomNumber}</Td>
                    <Td className="tabular-nums">
                      <span className="flex items-center gap-3">
                        {room.occupied_seats} of {room.capacity}
                        <span
                          aria-hidden="true"
                          className="hidden h-2 w-24 overflow-hidden rounded-full bg-muted @xl:block"
                        >
                          <span
                            className="block h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.min(100, (room.occupied_seats / room.capacity) * 100)}%`,
                            }}
                          />
                        </span>
                      </span>
                    </Td>
                    <Td>
                      {room.isLocked ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-destructive">
                          <Lock className="size-4" aria-hidden="true" />
                          Locked
                        </span>
                      ) : full ? (
                        <span className="text-foreground">Full</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-foreground">
                          <CircleCheck
                            className="size-4 text-success"
                            aria-hidden="true"
                          />
                          {room.capacity - room.occupied_seats} free
                        </span>
                      )}
                    </Td>
                    <Td className="text-right">
                      <RoomLockButton
                        roomId={room._id}
                        roomNumber={room.roomNumber}
                        locked={room.isLocked}
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableFrame>
        </section>
      )}
    </>
  );
}

function RoomsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading rooms</span>
      <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
          <Skeleton key={i} className="h-24 rounded-2xl bg-muted" />
        ))}
      </div>
      <Skeleton className="h-14 rounded-2xl bg-muted" />
      <Skeleton className="h-80 rounded-2xl bg-muted" />
    </div>
  );
}
