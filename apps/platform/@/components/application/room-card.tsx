"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { InferSelectModel } from "drizzle-orm";
import {
  Box,
  Clock,
  DoorOpen,
  Trash2,
  Users,
  XCircle
} from "lucide-react";
import type React from "react";
import toast from "react-hot-toast";
import { deleteRoom, updateRoom } from "~/actions/common.room";
import type { Session } from "~/auth/client";
import type { rooms } from "~/db/schema/room";

type RoomSelect = InferSelectModel<typeof rooms>;

// --- Helper: Date Formatter ---
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
  const authorized = user
    ? user?.role === "admin" ||
      user.other_roles?.includes("cr") ||
      user.other_roles?.includes("faculty")
    : false;

  const isAvailable = room.currentStatus === "available";

  const handleSwitch = (checked: boolean) => {
    if (!(user && authorized)) return;
    
    // Optimistic toggle logic (could be improved with useOptimistic)
    const newStatus = checked ? "occupied" : "available";
    
    toast.promise(
      updateRoom(
        room.id,
        { currentStatus: newStatus },
        { userId: user.id }
      ),
      {
        loading: `Updating ${room.roomNumber}...`,
        success: `${room.roomNumber} is now ${newStatus}`,
        error: "Failed to update status",
      }
    );
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 border-border/50 hover:shadow-lg",
        isAvailable 
            ? "hover:border-emerald-500/30" 
            : "hover:border-rose-500/30",
        className
      )}
      {...props}
    >
      {/* --- Delete Action (Admin Only) --- */}
      {user?.role === "admin" && deletable && (
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8 rounded-full shadow-sm"
            onClick={() => {
              if (confirm(`Delete room ${room.roomNumber}?`)) {
                 toast.promise(deleteRoom(room.id), {
                    loading: "Deleting...",
                    success: "Room deleted",
                    error: "Failed to delete"
                 });
              }
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      )}

      {/* --- Header: Room Number & Status Indicator --- */}
      <CardHeader className="pb-4 pt-5 px-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className={cn(
                "flex items-center justify-center size-12 rounded-xl text-lg font-bold border shadow-sm",
                isAvailable 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
             )}>
                {isAvailable ? <DoorOpen className="size-6" /> : <XCircle className="size-6" />}
             </div>
             <div>
                <h3 className="text-lg font-bold leading-tight">{room.roomNumber}</h3>
                <p className={cn(
                    "text-xs font-medium uppercase tracking-wider mt-0.5 flex items-center gap-1",
                    isAvailable ? "text-emerald-600" : "text-rose-600"
                )}>
                    {isAvailable ? "Available" : "Occupied"}
                </p>
             </div>
          </div>

          {/* Toggle Switch */}
          {authorized && (
             <div className="flex flex-col items-end gap-1.5">
                <Switch
                    checked={!isAvailable}
                    onCheckedChange={handleSwitch}
                    className={cn(
                        "data-[state=checked]:bg-rose-500",
                        "data-[state=unchecked]:bg-emerald-500"
                    )}
                />
                <span className="text-[10px] text-muted-foreground font-medium">
                    {isAvailable ? "Set Occupied" : "Set Free"}
                </span>
             </div>
          )}
        </div>
      </CardHeader>

      {/* --- Body: Metadata --- */}
      <CardContent className="px-5 pb-4">
         <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/40">
                <Users className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Capacity</span>
                    <span className="text-sm font-medium">{room.capacity}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/40">
                <Box className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Type</span>
                    <span className="text-sm font-medium capitalize truncate">{room.roomType}</span>
                </div>
            </div>
         </div>
      </CardContent>

      {/* --- Footer: Activity Log --- */}
      <CardFooter className="px-5 py-3 bg-muted/30 border-t border-border/40 min-h-[3rem]">
         <div className="flex items-center gap-2 text-xs text-muted-foreground/80 w-full">
            <Clock className="size-3.5 shrink-0" />
            <span className="truncate">
                {room.lastUpdatedTime 
                    ? `Updated ${formatDateAgo(new Date(room.lastUpdatedTime).toISOString())}` 
                    : "No recent activity"
                }
                {room.latestUsageHistory && (
                    <span className="font-medium text-foreground ml-1">
                        by {room.latestUsageHistory.name.split(" ")[0]}
                    </span>
                )}
            </span>
         </div>
      </CardFooter>
    </Card>
  );
}