import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Minus,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import type { ResultTypeWithId } from "src/models/result";

type ResultType = Omit<ResultTypeWithId, "semesters"> & {
  cgpi: number;
  prevCgpi?: number;
};

/** Rank chip: top three carry a trophy glyph, so the podium never relies on colour. */
export function RankChip({
  rank,
  className,
}: {
  rank: number;
  className?: string;
}) {
  const podium = rank >= 1 && rank <= 3;
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 text-caption font-semibold tabular-nums",
        podium
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border text-foreground",
        className
      )}
    >
      {podium && <Trophy className="size-3.5" aria-hidden="true" />}
      <span className="sr-only">College rank </span>#{rank}
    </span>
  );
}

/** CGPI change since the previous semester, stated with a glyph and a sign. */
export function TrendDelta({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const rounded = Math.round(delta * 100) / 100;
  const Icon = rounded > 0 ? TrendingUp : rounded < 0 ? TrendingDown : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-caption font-medium tabular-nums",
        rounded > 0 && "text-success",
        rounded < 0 && "text-destructive",
        rounded === 0 && "text-muted-foreground"
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {rounded > 0 ? "+" : ""}
      {rounded.toFixed(2)}
      <span className="sr-only"> since last semester</span>
    </span>
  );
}

export function ResultCard({
  result,
  className,
}: {
  result: ResultType;
  className?: string;
}) {
  const delta =
    typeof result.prevCgpi === "number" && typeof result.cgpi === "number"
      ? result.cgpi - result.prevCgpi
      : null;

  return (
    <Link
      href={`/results/${result.rollNo}`}
      prefetch={false}
      className={cn(
        "group flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-5 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring dark:bg-background",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-body-lg font-medium text-foreground">
            {result.name}
          </h3>
          <p className="mt-1 flex min-w-0 items-center gap-2 text-caption text-muted-foreground">
            <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-foreground">
              {result.rollNo}
            </span>
            <span className="truncate">{result.branch}</span>
          </p>
        </div>
        <RankChip rank={result.rank.college} />
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-caption text-muted-foreground">CGPI</p>
          <p className="flex items-baseline gap-2">
            <span className="font-heading text-heading font-medium tabular-nums text-foreground">
              {typeof result.cgpi === "number" ? result.cgpi.toFixed(2) : "N/A"}
            </span>
            <TrendDelta delta={delta} />
          </p>
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 text-caption">
          <dt className="text-muted-foreground">Branch</dt>
          <dd className="text-right font-mono tabular-nums text-foreground">
            #{result.rank.branch}
          </dd>
          <dt className="text-muted-foreground">Batch</dt>
          <dd className="text-right font-mono tabular-nums text-foreground">
            #{result.rank.batch}
          </dd>
          <dt className="text-muted-foreground">Class</dt>
          <dd className="text-right font-mono tabular-nums text-foreground">
            #{result.rank.class}
          </dd>
        </dl>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-caption">
        <span className="text-muted-foreground">
          {result.programme} · Batch {result.batch || "N/A"}
        </span>
        <span className="flex items-center gap-1 font-medium text-primary">
          View result
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 dark:bg-background">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-7 w-12 rounded-full" />
      </div>
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex justify-between border-t border-border pt-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
