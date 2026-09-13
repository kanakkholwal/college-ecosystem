"use client";

import { cn } from "@/lib/utils";
import { Clock, Lock } from "lucide-react";
import { useSyncExternalStore } from "react";
import { timeLeftLabel } from "./utils";

const TICK_MS = 30_000;
const listeners = new Set<() => void>();
let current = 0;
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    current = Date.now();
    timer = setInterval(() => {
      current = Date.now();
      for (const notify of listeners) notify();
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      current = 0;
    }
  };
}

function getSnapshot() {
  if (current === 0) current = Date.now();
  return current;
}

/** Shared 30s clock. Hydrates with `serverNow` so markup matches, then switches to client time. */
export function useNow(serverNow: number) {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverNow);
}

export function PollStatus({
  closesAt,
  now,
  className,
}: {
  closesAt: string;
  now: number;
  className?: string;
}) {
  const time = useNow(now);
  const label = timeLeftLabel(closesAt, time);
  const closed = label === "Closed";
  const Glyph = closed ? Lock : Clock;

  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-caption font-medium tabular-nums",
        closed
          ? "border-border bg-muted text-muted-foreground"
          : "border-primary/30 bg-primary/10 text-primary",
        className
      )}
    >
      <Glyph className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
