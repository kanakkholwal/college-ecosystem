"use client";

import { cn } from "@/lib/utils";
import { ResponsiveContainer } from "./container";

interface StatItem {
  label: string;
  value: string | number;
  status?: "success" | "warning" | "error" | "default";
}

interface AnalyticsGridProps {
  stats: StatItem[];
  className?: string;
}

export function AnalyticsGrid({ stats, className }: AnalyticsGridProps) {
  return (
    <ResponsiveContainer
      className={cn(
        "@5xl:grid-cols-3 pr-1.5 @4xl:pr-0",
        className
      )}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          className="p-4 border rounded-lg shadow-sm bg-card flex flex-col items-start"
        >
          <h5 className="text-sm font-medium text-muted-foreground">
            {stat.label}
          </h5>
          <p
            className={cn(
              "text-xl font-semibold mt-1",
              stat.status === "success" && "text-green-500",
              stat.status === "warning" && "text-yellow-500",
              stat.status === "error" && "text-red-500"
            )}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </ResponsiveContainer>
  );
}
