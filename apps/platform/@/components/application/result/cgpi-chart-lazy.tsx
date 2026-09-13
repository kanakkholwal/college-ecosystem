"use client";

import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

/** Recharts only loads when the Graph tab mounts, keeping it out of the result page's first bundle. */
export const CGPIChartLazy = dynamic(
  () => import("./chart").then((m) => m.CGPIChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-87 w-full rounded-xl" />,
  }
);
