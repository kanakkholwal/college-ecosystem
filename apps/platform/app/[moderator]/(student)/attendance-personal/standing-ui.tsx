import { cn } from "@/lib/utils";
import { CircleCheck, CircleMinus, CircleX, TriangleAlert } from "lucide-react";
import {
  ATTENDANCE_THRESHOLD,
  type Standing,
  type StandingLevel,
} from "./standing";

const tone: Record<StandingLevel, { pill: string; bar: string }> = {
  none: { pill: "border-border text-muted-foreground", bar: "bg-muted" },
  safe: { pill: "border-success/40 text-success", bar: "bg-primary" },
  edge: { pill: "border-warning/40 text-warning", bar: "bg-warning" },
  below: {
    pill: "border-destructive/40 text-destructive",
    bar: "bg-destructive",
  },
};

const glyph = {
  none: CircleMinus,
  safe: CircleCheck,
  edge: TriangleAlert,
  below: CircleX,
} satisfies Record<StandingLevel, unknown>;

export function StandingBadge({
  standing,
  className,
}: {
  standing: Standing;
  className?: string;
}) {
  const Glyph = glyph[standing.level];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-caption font-medium",
        tone[standing.level].pill,
        className
      )}
    >
      <Glyph className="size-3.5" aria-hidden="true" />
      {standing.label}
    </span>
  );
}

export function ThresholdBar({ standing }: { standing: Standing }) {
  return (
    <div className="relative py-1" aria-hidden="true">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-200 ease-craft",
            tone[standing.level].bar
          )}
          style={{ width: `${standing.rate ?? 0}%` }}
        />
      </div>
      <span
        className="absolute inset-y-0 w-0.5 rounded-full bg-foreground"
        style={{ left: `${ATTENDANCE_THRESHOLD}%` }}
      />
    </div>
  );
}
