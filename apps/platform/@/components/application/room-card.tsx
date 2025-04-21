"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { InferSelectModel } from "drizzle-orm";
import type React from "react";
import toast from "react-hot-toast";
import { updateRoom } from "~/actions/room";
import type { roomUsageHistory, rooms } from "~/db/schema/room";
import type { Session } from "~/lib/auth-client";

type RoomSelect = InferSelectModel<typeof rooms>;
type UsageHistorySelect = InferSelectModel<typeof roomUsageHistory>;

// Function to convert a date string to local time string + time ago format
function formatDateAgo(dateString: string): string {
  const date = parseISO(dateString);
  const localTimeString = date.toLocaleTimeString(); // Convert to local time string
  const timeAgo = formatDistanceToNow(date, { addSuffix: true }); // Calculate time ago

  return `${localTimeString} (${timeAgo})`;
}

interface Props extends React.ComponentProps<typeof Card> {
  room: RoomSelect & {
    latestUsageHistory: { username: string; name: string } | null;
  };
  user?: Session["user"];
}

export default function RoomCard({ room, user, ...props }: Props) {
  const authorized = user
    ? user?.role === "admin" ||
      user.other_roles?.includes("cr") ||
      user.other_roles?.includes("faculty")
    : false;

  const handleSwitch = (value: boolean) => {
    if (!(user && authorized)) return;
    toast.promise(
      updateRoom(
        room.id,
        {
          currentStatus:
            room.currentStatus === "available" ? "occupied" : "available",
        },
        {
          userId: user.id,
        }
      ),
      {
        loading: `Updating ${room.roomNumber} status...`,
        success: `Room ${room.roomNumber} status updated successfully!`,
        error: `Failed to update ${room.roomNumber} status!`,
      }
    );
  };

  return (
    <Card
      className="hover:shadow-lg animate-in popup @container/0"
      {...props}
    >
      <CardHeader className="p-4">
        <div className="flex flex-wrap w-full justify-between">
          <div className="flex justify-center items-center size-12 rounded-full bg-muted font-bold text-lg shrink-0">
            {room.roomNumber}
          </div>
          {authorized && (
            <div className="inline-flex flex-col items-end text-left ml-auto">
              <Label
                htmlFor="switch"
                className="text-xs text-muted-foreground font-semibold"
              >
                {room.currentStatus === "available" ? "Occupy" : "Release"}
              </Label>
              <Switch
                id="switch"
                defaultChecked={!(room.currentStatus === "available")}
                checked={!(room.currentStatus === "available")}
                onCheckedChange={(value) => handleSwitch(value)}
              />
            </div>
          )}
        </div>
        <CardDescription
          className="font-medium text-[10px] text-muted-foreground"
          suppressHydrationWarning={true}
        >
          Last updated:{" "}
          {room.lastUpdatedTime
            ? formatDateAgo(new Date(room.lastUpdatedTime).toISOString())
            : "N/A"}
          {room.latestUsageHistory ? ` by ${room.latestUsageHistory.name}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex w-full flex-wrap justify-around items-start gap-2 p-4 ">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium  text-muted-foreground">Capacity</span>
            <Badge className="uppercase" variant="default_light" size="sm">
              {room.capacity}
            </Badge>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium  text-muted-foreground">Room Type</span>
            <Badge className="uppercase" variant="ghost" size="sm">
              {room.roomType}
            </Badge>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium  text-muted-foreground">
              Current Status
            </span>
            <Badge
              className="uppercase"
              size="sm"
              variant={
                room.currentStatus === "available" ? "success" : "destructive"
              }
            >
              {room.currentStatus}
            </Badge>
          </div>
      </CardContent>
    </Card>
  );
}
