"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

type Snapshot = { count: number | null };

let snapshot: Snapshot = { count: null };
const listeners = new Set<() => void>();
let lastRecorded: { path: string; at: number } | null = null;

function emit(next: Snapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

function record(path: string) {
  const now = Date.now();
  // Strict Mode and parallel subscribers mount twice; one view per path per second is enough.
  if (
    lastRecorded &&
    lastRecorded.path === path &&
    now - lastRecorded.at < 1000
  ) {
    return;
  }
  lastRecorded = { path, at: now };
  fetch("/api/impressions", { method: "POST", cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { count?: number } | null) => {
      if (typeof data?.count === "number") emit({ count: data.count });
    })
    .catch(() => {});
}

/** Live impressions total, shared by every subscriber; each client navigation counts as one view. */
export function useImpressions(): number | null {
  const pathname = usePathname();
  useEffect(() => {
    record(pathname);
  }, [pathname]);
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot.count,
    () => null
  );
}
