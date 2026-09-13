import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { InferSelectModel } from "drizzle-orm";
import { Box, Check, Clock, Lock, Users } from "lucide-react";
import type { Session } from "~/auth/client";
import type { rooms } from "~/db/schema/room";
import { RoomControls } from "./controls";

type RoomSelect = InferSelectModel<typeof rooms>;

interface Props extends React.HTMLAttributes<HTMLElement> {
  room: RoomSelect & {
    latestUsageHistory: { username: string; name: string } | null;
  };
  user?: Pick<Session["user"], "id" | "role" | "other_roles">;
  deletable?: boolean;
}

export function RoomStatus({ occupied }: { occupied: boolean }) {
  const Icon = occupied ? Lock : Check;
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 text-caption font-medium",
        occupied
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-success/30 bg-success/10 text-success"
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {occupied ? "Occupied" : "Available"}
    </span>
  );
}

export default function RoomCard({
  room,
  user,
  deletable = false,
  className,
  ...props
}: Props) {
  const canToggle =
    !!user &&
    (user.role === "admin" ||
      user.other_roles?.includes("cr") ||
      user.other_roles?.includes("faculty"));
  const occupied = room.currentStatus === "occupied";

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate font-mono text-body-lg font-medium text-foreground">
          {room.roomNumber}
        </h3>
        <RoomStatus occupied={occupied} />
      </div>

      <dl className="grid grid-cols-2 gap-3 text-body">
        <div className="flex flex-col gap-0.5">
          <dt className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" />
            Capacity
          </dt>
          <dd className="font-medium text-foreground tabular-nums">
            {room.capacity ? `${room.capacity} seats` : "Not listed"}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <Box className="size-3.5" aria-hidden="true" />
            Type
          </dt>
          <dd className="font-medium capitalize text-foreground">
            {room.roomType}
          </dd>
        </div>
      </dl>

      {canToggle && user && (
        <RoomControls
          roomId={room.id}
          roomNumber={room.roomNumber}
          status={occupied ? "occupied" : "available"}
          userId={user.id}
          canDelete={deletable && user.role === "admin"}
        />
      )}

      <p className="mt-auto flex min-w-0 items-center gap-1.5 border-t border-border pt-3 text-caption text-muted-foreground">
        <Clock className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">
          {room.lastUpdatedTime ? (
            <>
              Updated{" "}
              <time
                dateTime={new Date(room.lastUpdatedTime).toISOString()}
                suppressHydrationWarning
              >
                {formatDistanceToNow(new Date(room.lastUpdatedTime), {
                  addSuffix: true,
                })}
              </time>
            </>
          ) : (
            "Never updated"
          )}
          {room.latestUsageHistory && (
            <> by {room.latestUsageHistory.name}</>
          )}
        </span>
      </p>
    </article>
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="border-t border-border pt-3">
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}
