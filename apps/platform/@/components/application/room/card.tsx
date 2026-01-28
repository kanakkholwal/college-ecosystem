"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { InferSelectModel } from "drizzle-orm";
import {
  Box,
  Clock,
  MoreHorizontal,
  Trash2,
  Users,
  Zap
} from "lucide-react";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { deleteRoom, updateRoom } from "~/actions/common.room";
import type { Session } from "~/auth/client";
import type { rooms } from "~/db/schema/room";

type RoomSelect = InferSelectModel<typeof rooms>;

function formatDateAgo(dateString: string): string {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

interface Props extends React.ComponentProps<typeof Card> {
  room: RoomSelect & {
    latestUsageHistory: { username: string; name: string } | null;
  };
  user?: Session["user"];
  deletable?: boolean;
}

export default function RoomCard({
  room,
  user,
  deletable = false,
  className,
  ...props
}: Props) {
  const [isPending, startTransition] = useTransition();

  const authorized = user
    ? user?.role === "admin" ||
    user.other_roles?.includes("cr") ||
    user.other_roles?.includes("faculty")
    : false;

  const isAvailable = room.currentStatus === "available";

  const handleSwitch = (checked: boolean) => {
    if (!authorized) return;
    const targetStatus = checked ? "occupied" : "available";

    startTransition(() => {
      toast.promise(
        updateRoom(
          room.id,
          { currentStatus: targetStatus },
          { userId: user!.id }
        ),
        {
          loading: "Updating status...",
          success: `Room is now ${targetStatus}`,
          error: "Update failed",
        }
      );
    });
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "border-border/50 bg-card hover:border-primary/20 hover:shadow-md",
        className
      )}
      {...props}
    >


      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xl tracking-tight">{room.roomNumber}</h3>
            {/* Status Dot */}
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              isAvailable
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
            )}>
              <span className={cn("size-1.5 rounded-full animate-pulse", isAvailable ? "bg-emerald-500" : "bg-rose-500")} />
              {isAvailable ? "Online" : "Busy"}
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            ID: {room.id.slice(0, 8)}
          </p>
        </div>

        {/* Actions Menu */}
        {authorized && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon_sm" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {deletable && user?.role === "admin" && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (confirm("Delete room?")) {
                      toast.promise(deleteRoom(room.id), {
                        loading: "Deleting...",
                        success: "Room deleted",
                        error: "Failed"
                      });
                    }
                  }}
                >
                  <Trash2 className="mr-2 size-3.5" /> Delete Room
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
              <Users className="size-3" /> Capacity
            </span>
            <span className="text-sm font-medium">{room.capacity} Seats</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
              <Box className="size-3" /> Type
            </span>
            <span className="text-sm font-medium capitalize">{room.roomType}</span>
          </div>
        </div>

        {/* Toggle Area */}
        {authorized && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
            <div className="flex items-center gap-2">
              <Zap className={cn("size-4", isAvailable ? "text-muted-foreground" : "text-rose-500")} />
              <span className="text-xs font-medium">Occupancy Status</span>
            </div>
            <Switch
              checked={!isAvailable}
              onCheckedChange={handleSwitch}
              disabled={isPending}
              className={cn(
                "data-[state=checked]:bg-rose-500",
                "data-[state=unchecked]:bg-emerald-500"
              )}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 w-full border-t border-border/40 pt-3">
          <Clock className="size-3" />
          <span className="truncate">
            Updated {room.lastUpdatedTime ? formatDateAgo(new Date(room.lastUpdatedTime).toISOString()) : "never"}
            {room.latestUsageHistory && (
              <span className="text-foreground/80 ml-1">
                by {room.latestUsageHistory.name}
              </span>
            )}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}