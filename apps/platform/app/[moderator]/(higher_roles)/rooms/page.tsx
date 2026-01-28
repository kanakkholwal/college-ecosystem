import RoomCard from "@/components/application/room/card";
import SearchBox from "@/components/application/room/search";
import { ResponsiveContainer } from "@/components/common/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  Building2,
  DoorOpen,
  LayoutGrid,
  Lock,
  Plus,
  Search
} from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import { getRoomsInfo, listAllRoomsWithHistory } from "~/actions/common.room";
import { getSession } from "~/auth/server";
import { changeCase } from "~/utils/string";

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
    title: `Rooms | ${changeCase(params.moderator, "title")} Dashboard`,
    description: "Manage campus facilities and room availability.",
  };
}

export default async function RoomsPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const session = await getSession();

  const moderator = params.moderator;
  const query = searchParams?.query || "";
  const status = searchParams?.currentStatus || "";

  // Fetch Data
  const roomsPromise = listAllRoomsWithHistory({ status, roomNumber: query });
  const statsPromise = getRoomsInfo();

  const [rooms, stats] = await Promise.all([roomsPromise, statsPromise]);

  return (
    <div className="min-h-screen bg-background pb-20 space-y-8">

      {/* --- 1. Header & KPI Section --- */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="size-6 text-primary/80" />
              Facility Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor real-time occupancy and manage room configurations.
            </p>
          </div>

          {session?.user.role === "admin" && (<ButtonLink
            href={`/admin/rooms/new`}
            variant="default"
            size="sm"
            className="gap-2 shadow-md shadow-primary/20 rounded-full"
          >
            <Plus className="size-4" /> New Room
          </ButtonLink>)}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Capacity"
            value={stats.totalRooms}
            icon={LayoutGrid}
            color="text-blue-500"
            bg="bg-blue-500/10"
            borderColor="border-blue-500/20"
          />
          <StatCard
            label="Available Now"
            value={stats.totalAvailableRooms}
            icon={DoorOpen}
            color="text-emerald-600"
            bg="bg-emerald-500/10"
            borderColor="border-emerald-500/20"
          />
          <StatCard
            label="Occupied"
            value={stats.totalOccupiedRooms}
            icon={Lock}
            color="text-rose-600"
            bg="bg-rose-500/10"
            borderColor="border-rose-500/20"
          />
        </div>
      </div>

      <div className="sticky top-4 z-30 bg-background/80 backdrop-blur-xl border border-border/50 rounded-xl p-2 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            {/* SearchBox acts as the filter controller */}
            <SearchBox />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4 px-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Room Directory
          </h2>
          <Badge variant="default" size="sm">
            {rooms.length}
          </Badge>
        </div>

        <ResponsiveContainer className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          <ErrorBoundaryWithSuspense
            key={query + status} // Remount on filter change
            fallback={
              <div className="col-span-full py-12 text-center rounded-xl border border-dashed bg-muted/20">
                <p className="text-muted-foreground">Unable to load rooms.</p>
              </div>
            }
            loadingFallback={
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
                ))}
              </>
            }
          >
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                user={session?.user}
                deletable
              />
            ))}

            {rooms.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-xl bg-card/50">
                <Search className="size-10 mb-4 opacity-20" />
                <p>No rooms match your criteria.</p>
              </div>
            )}
          </ErrorBoundaryWithSuspense>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Sub-component: KPI Card ---
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  borderColor
}: {
  label: string,
  value: number,
  icon: React.FC<React.SVGProps<SVGSVGElement>>,
  color: string,
  bg: string,
  borderColor: string
}) {
  return (
    <Card className={cn("border shadow-sm", borderColor)}>
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn("p-3 rounded-xl", bg, color)}>
          <Icon className="size-6" />
        </div>
      </CardContent>
    </Card>
  )
}