"use client";

import {
  CircleCheck,
  Crown,
  LoaderCircle,
  Lock,
  SearchX,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { EmptyNote } from "@/components/application/dashboard/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ControlledResponsiveDialog } from "@/components/ui/responsive-dialog";
import { cn } from "@/lib/utils";
import {
  addRoomMembers,
  joinRoom,
  type MyAllotment,
} from "~/actions/hostel.allotment-process";
import type { HostelRoomJson } from "~/models/allotment";

type Availability = "free" | "full" | "locked";

const availability = (room: HostelRoomJson): Availability =>
  room.isLocked
    ? "locked"
    : room.occupied_seats >= room.capacity
      ? "full"
      : "free";

const FILTERS: { value: "free" | "all"; label: string }[] = [
  { value: "free", label: "Free beds only" },
  { value: "all", label: "All rooms" },
];

export function RoomPicker({
  rooms,
  cgpi,
}: {
  rooms: HostelRoomJson[];
  cgpi: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [show, setShow] = useState<"free" | "all">("free");
  const [chosen, setChosen] = useState<HostelRoomJson | null>(null);
  const [busy, setBusy] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms.filter(
      (r) =>
        (!q || r.roomNumber.toLowerCase().includes(q)) &&
        (show === "all" || availability(r) === "free")
    );
  }, [rooms, query, show]);

  const freeCount = rooms.filter((r) => availability(r) === "free").length;

  // Not optimistic: a join can be refused by capacity, a lock or another student picking first.
  const confirmJoin = async () => {
    if (!chosen) return;
    setBusy(true);
    try {
      const res = await joinRoom(chosen._id);
      if (res.error) {
        toast.error(res.message);
        router.refresh();
        return;
      }
      toast.success(res.message);
      setChosen(null);
      router.refresh();
    } catch {
      // A rejected action (network drop, redeploy) would otherwise fail silently.
      toast.error(
        "Couldn't reach the server. Check your connection and try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const chosenFull = chosen ? availability(chosen) === "full" : false;

  return (
    <section aria-labelledby="picker-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2
            id="picker-heading"
            className="text-subheading font-medium text-foreground"
          >
            Choose a room
          </h2>
          <p className="text-body text-muted-foreground">
            {freeCount} of {rooms.length} rooms have a free bed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Room number"
            aria-label="Search rooms by number"
            className="h-10 w-40"
          />
          <div role="radiogroup" aria-label="Show" className="flex gap-1">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                role="radio"
                aria-checked={show === f.value}
                variant={show === f.value ? "outline" : "ghost"}
                onClick={() => setShow(f.value)}
                className={cn(
                  show === f.value &&
                    "border-primary bg-primary/10 text-primary"
                )}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyNote
          icon={<SearchX />}
          title={rooms.length === 0 ? "No rooms added yet" : "No rooms match"}
          description={
            rooms.length === 0
              ? "The warden hasn't added rooms for this hostel."
              : "Try another number, or show all rooms."
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 @xl:grid-cols-3 @4xl:grid-cols-5">
          {visible.map((room) => {
            const state = availability(room);
            const free = room.capacity - room.occupied_seats;
            return (
              <li key={room._id}>
                <button
                  type="button"
                  disabled={state === "locked"}
                  onClick={() => setChosen(room)}
                  className="flex h-full w-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:shadow-none dark:bg-background"
                >
                  <span className="font-mono text-body-lg font-medium text-foreground">
                    {room.roomNumber}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-body",
                      state === "free" && "text-foreground",
                      state === "full" && "text-muted-foreground",
                      state === "locked" && "text-muted-foreground"
                    )}
                  >
                    {state === "locked" ? (
                      <>
                        <Lock className="size-4" aria-hidden="true" />
                        Locked
                      </>
                    ) : state === "full" ? (
                      "Full"
                    ) : (
                      <>
                        <CircleCheck
                          className="size-4 text-success"
                          aria-hidden="true"
                        />
                        {free} of {room.capacity} free
                      </>
                    )}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {room.capacity}-bed room
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ControlledResponsiveDialog
        open={chosen !== null}
        onOpenChange={(open) => !busy && !open && setChosen(null)}
        title={chosen ? `Take a bed in room ${chosen.roomNumber}?` : ""}
        description={
          chosenFull
            ? `This room is full. You get a bed only if your CGPI (${cgpi.toFixed(2)}) is higher than a current member's, who then goes back to picking.`
            : "You can hold one room at a time. Only the warden can move you after this."
        }
        hideClose
      >
        <div className="flex justify-end gap-2 pb-4">
          <Button
            variant="ghost"
            onClick={() => setChosen(null)}
            disabled={busy}
          >
            Keep looking
          </Button>
          <Button variant="primary" onClick={confirmJoin} disabled={busy}>
            {busy && (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            )}
            {chosen ? `Confirm room ${chosen.roomNumber}` : "Confirm"}
          </Button>
        </div>
      </ControlledResponsiveDialog>
    </section>
  );
}

export function MyRoomPanel({
  room,
  selectionOpen,
}: {
  room: NonNullable<MyAllotment["room"]>;
  selectionOpen: boolean;
}) {
  const router = useRouter();
  const [rolls, setRolls] = useState("");
  const [busy, setBusy] = useState(false);
  const free = room.capacity - room.occupied;

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    const list = rolls
      .split(/[\s,]+/)
      .map((r) => r.trim())
      .filter(Boolean);
    if (list.length === 0) return;
    setBusy(true);
    try {
      const res = await addRoomMembers(room._id, undefined, list);
      if (res.error) toast.error(res.message);
      else {
        toast.success(res.message);
        setRolls("");
        router.refresh();
      }
    } catch {
      // A rejected action (network drop, redeploy) would otherwise fail silently.
      toast.error(
        "Couldn't reach the server. Check your connection and try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-labelledby="my-room-heading"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 dark:bg-background"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-caption font-medium text-muted-foreground">
            Your allotment
          </p>
          <h2
            id="my-room-heading"
            className="text-heading-sm font-medium text-foreground"
          >
            Room <span className="font-mono">{room.roomNumber}</span>
          </h2>
          <p className="text-body text-muted-foreground">
            {room.occupied} of {room.capacity} beds taken
            {room.isHost ? ". You are the host." : "."}
          </p>
        </div>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border px-2.5 text-caption font-medium text-success">
          <CircleCheck className="size-3.5" aria-hidden="true" />
          Confirmed
        </span>
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border">
        {room.members.map((m) => (
          <li
            key={m.rollNumber}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <span className="min-w-0">
              <span className="block truncate text-body font-medium text-foreground">
                {m.name}
                {m.isYou && (
                  <span className="text-muted-foreground"> (you)</span>
                )}
              </span>
              <span className="block font-mono text-caption text-muted-foreground">
                {m.rollNumber}
              </span>
            </span>
            {m.isHost && (
              <span className="inline-flex items-center gap-1 text-caption font-medium text-foreground">
                <Crown className="size-3.5 text-primary" aria-hidden="true" />
                Host
              </span>
            )}
          </li>
        ))}
      </ul>

      {room.isHost && selectionOpen && free > 0 && (
        <form onSubmit={add} className="flex flex-col gap-2">
          <label
            htmlFor="roommates"
            className="text-body font-medium text-foreground"
          >
            Add roommates ({free} {free === 1 ? "bed" : "beds"} left)
          </label>
          <div className="flex flex-wrap gap-2">
            <Input
              id="roommates"
              value={rolls}
              onChange={(e) => setRolls(e.target.value)}
              placeholder="Roll numbers, separated by commas"
              className="h-10 min-w-0 flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={busy || !rolls.trim()}
            >
              {busy ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus aria-hidden="true" />
              )}
              Add
            </Button>
          </div>
          <p className="text-caption text-muted-foreground">
            They must live in this hostel and not already have a room.
          </p>
        </form>
      )}
    </section>
  );
}
