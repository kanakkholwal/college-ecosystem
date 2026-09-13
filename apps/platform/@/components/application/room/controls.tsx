"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useOptimistic, useTransition } from "react";
import toast from "react-hot-toast";
import { deleteRoom, updateRoom } from "~/actions/common.room";

type Status = "available" | "occupied";

export function RoomControls({
  roomId,
  roomNumber,
  status,
  userId,
  canDelete,
}: {
  roomId: string;
  roomNumber: string;
  status: Status;
  userId: string;
  canDelete: boolean;
}) {
  const id = useId();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(status);
  const occupied = optimistic === "occupied";

  const setStatus = (checked: boolean) => {
    const next: Status = checked ? "occupied" : "available";
    startTransition(async () => {
      setOptimistic(next);
      try {
        await toast.promise(
          updateRoom(
            roomId,
            { currentStatus: next, lastUpdatedTime: new Date() },
            { userId }
          ),
          {
            loading: `Marking ${roomNumber} ${next}...`,
            success: `${roomNumber} is now ${next}`,
            error: "Couldn't update the room",
          }
        );
        router.refresh();
      } catch {
        // toast already reported it; the optimistic value reverts with the transition
      }
    });
  };

  const remove = () => {
    if (!confirm(`Delete room ${roomNumber}? Its usage history goes too.`)) {
      return;
    }
    startTransition(async () => {
      try {
        await toast.promise(deleteRoom(roomId), {
          loading: `Deleting ${roomNumber}...`,
          success: `${roomNumber} deleted`,
          error: "Couldn't delete the room",
        });
        router.refresh();
      } catch {
        // reported by the toast
      }
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
      <label
        htmlFor={id}
        className="flex min-w-0 flex-1 cursor-pointer flex-col text-body"
      >
        <span className="font-medium text-foreground">Occupied</span>
        <span className="text-caption text-muted-foreground">
          {isPending ? "Saving..." : occupied ? "In use now" : "Free to use"}
        </span>
      </label>
      <Switch
        id={id}
        checked={occupied}
        onCheckedChange={setStatus}
        disabled={isPending}
      />
      {canDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon_sm"
          onClick={remove}
          disabled={isPending}
          aria-label={`Delete room ${roomNumber}`}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 />
        </Button>
      )}
    </div>
  );
}
