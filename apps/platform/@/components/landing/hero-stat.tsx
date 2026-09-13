"use client";

import { CountUp } from "@/components/animation/count-up";
import { useImpressions } from "@/components/common/impressions";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="order-2 text-caption text-muted-foreground">{label}</dt>
      <dd className="order-1 font-heading text-heading-sm font-medium tabular-nums text-foreground">
        <CountUp value={value} />
      </dd>
    </div>
  );
}

/** Reads the same per-view impressions total as the floating badge, so the page records one view. */
export function ImpressionsStat() {
  const count = useImpressions();
  if (count === null) {
    return (
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-8 w-16" />
        <span className="text-caption text-muted-foreground">Impressions</span>
      </div>
    );
  }
  return <HeroStat label="Impressions" value={count} />;
}
