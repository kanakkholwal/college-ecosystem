"use client";

import { CountUp } from "@/components/animation/count-up";
import { useImpressions } from "@/components/common/impressions";
import { Eye } from "lucide-react";

/** Global floating impressions pill; mounting it records the page view through /api/impressions. */
export function ImpressionsBadge() {
  const count = useImpressions();
  return (
    <div className="pointer-events-none fixed right-3 bottom-3 z-40">
      <p className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background/85 px-3 text-caption text-muted-foreground shadow-xs backdrop-blur-xl">
        <Eye className="size-3.5" aria-hidden="true" />
        <span className="min-w-8 font-medium tabular-nums text-foreground">
          {count === null ? (
            <span aria-hidden="true">...</span>
          ) : (
            <CountUp value={count} duration={900} />
          )}
        </span>
        impressions
      </p>
    </div>
  );
}
