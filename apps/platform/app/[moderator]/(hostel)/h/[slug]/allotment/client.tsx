"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Edit, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdOutlineChair } from "react-icons/md";
import {
  distributeSlots,
  lockToggleRoom,
  updateAllotmentProcess,
} from "~/actions/hostel.allotment-process";
import type { HostelRoomJson } from "~/models/allotment";

const statusSchema = [
  "open",
  "closed",
  "paused",
  "waiting",
  "completed",
] as const;
export type StatusType = (typeof statusSchema)[number];

export function ChangeAllotmentProcessStatusButton({
  currentStatus,
  hostelId,
}: {
  currentStatus: string;
  hostelId: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Change Status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statusSchema.map((status: StatusType) => {
          return (
            <DropdownMenuCheckboxItem
              key={status}
              checked={currentStatus === status}
              onCheckedChange={(checked) => {
                toast.promise(
                  updateAllotmentProcess(hostelId, { status, hostelId }),
                  {
                    loading: "Updating status...",
                    success: `Status updated to ${status}`,
                    error: `Error updating status to ${status}`,
                  }
                );
              }}
            >
              {status}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DistributeSlotsButton({ hostelId }: { hostelId: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        toast.promise(distributeSlots(hostelId), {
          loading: "Distributing slots...",
          success: "Slots distributed successfully",
          error: "Error distributing slots",
        });
      }}
    >
      Create Allotment Slots
    </Button>
  );
}

export function DownloadSlotButton({ hostelId }: { hostelId: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        toast.promise(distributeSlots(hostelId), {
          loading: "Downloading slots...",
          success: "Slots downloaded successfully",
          error: "Error downloading slots",
        });
      }}
    >
      Download Slots
    </Button>
  );
}

interface RoomsTableProps {
  rooms: HostelRoomJson[];
}

const getStatus = (
  occupied_seats: HostelRoomJson["occupied_seats"],
  capacity: HostelRoomJson["capacity"]
): [string, string] => {
  if (occupied_seats === 0) {
    return ["bg-green-500", "Vacant"];
  }
  if (occupied_seats < capacity) {
    return ["bg-yellow-500", "Partially Occupied"];
  }
  if (occupied_seats === capacity) {
    return ["bg-red-500", "Fully Occupied"];
  }
  return ["bg-gray-500", "Unknown"];
};

function onEdit(room: HostelRoomJson) {}

export function RoomsTable({ rooms }: RoomsTableProps) {
  return (
    <div className="my-10">
      <Table className="relative rounded-md border">
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead>Room No.</TableHead>
            <TableHead>Filled (Occupied/Capacity)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Lock Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {rooms.map((room) => (
            <RoomRow room={room} key={room._id} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RoomRow({ room }: { room: HostelRoomJson }) {
  const [updating, setUpdating] = useState(false);

  function onLockToggle(roomId: string) {
    toast
      .promise(lockToggleRoom(roomId), {
        loading: "Toggling lock status...",
        success: "Lock status toggled successfully",
        error: "Error toggling lock status",
      })
      .finally(() => {
        setUpdating(false);
      });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{room.roomNumber}</TableCell>
      <TableCell>
        <div className="flex flex-row items-center gap-2">
          {Array.from({ length: room.capacity }).map((_, index) => {
            return (
              <MdOutlineChair
                key={`room.${index.toString()}`}
                className={cn(
                  `text-gray-500 font-bold inline-block ${index + 1 <= room.occupied_seats ? "text-green-500" : "text-gray-500"}`
                )}
              />
            );
          })}
          <span className="text-grey-500 text-sm">
            {room.occupied_seats}/ {room.capacity}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getStatus(room.occupied_seats, room.capacity)[0]}>
          {getStatus(room.occupied_seats, room.capacity)[1]}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={room.isLocked ? "destructive" : "outline"}>
          {room.isLocked ? "Locked" : "Unlocked"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={updating}
            onClick={() => onLockToggle(room._id)}
          >
            {room.isLocked ? (
              <Unlock className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={updating}
            onClick={() => onEdit(room)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
