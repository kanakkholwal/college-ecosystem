"use client";

import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

/** Keeps recharts out of the dashboard's first bundle. */
export const AreaChartLazy = dynamic(
  () =>
    import("@/components/extended/chart.area").then((m) => m.GenericAreaChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background">
        <Skeleton className="h-5 w-48 bg-muted" />
        <Skeleton className="h-72 w-full rounded-xl bg-muted" />
      </div>
    ),
  }
);
