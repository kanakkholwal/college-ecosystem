"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useOptimistic, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { deleteRoom, updateRoom } from "~/actions/common.room";
import { callAction } from "~/lib/call-action";

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
  // The confirmed value keeps a success from flashing back before the refresh lands.
  const [confirmed, setConfirmed] = useState(status);
  const [seen, setSeen] = useState(status);
  if (status !== seen) {
    setSeen(status);
    setConfirmed(status);
  }
  const [optimistic, setOptimistic] = useOptimistic(confirmed);
  const occupied = optimistic === "occupied";

  const setStatus = (checked: boolean) => {
    const next: Status = checked ? "occupied" : "available";
    startTransition(async () => {
      setOptimistic(next);
      const toastId = toast.loading(`Marking ${roomNumber} ${next}...`);
      const res = await callAction(() =>
        updateRoom(
          roomId,
          { currentStatus: next, lastUpdatedTime: new Date() },
          { userId }
        )
      );
      // On failure the optimistic value rolls back when the transition ends.
      if (!res.ok) {
        toast.error(res.error, { id: toastId });
        return;
      }
      toast.success(`${roomNumber} is now ${next}`, { id: toastId });
      startTransition(() => setConfirmed(next));
      router.refresh();
    });
  };

  const remove = () => {
    if (!confirm(`Delete room ${roomNumber}? Its usage history goes too.`)) {
      return;
    }
    startTransition(async () => {
      const toastId = toast.loading(`Deleting ${roomNumber}...`);
      const res = await callAction(() => deleteRoom(roomId));
      if (!res.ok) {
        toast.error(res.error, { id: toastId });
        return;
      }
      toast.success(`${roomNumber} deleted`, { id: toastId });
      router.refresh();
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
