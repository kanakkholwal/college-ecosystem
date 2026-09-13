import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarRange } from "lucide-react";
import Link from "next/link";
import type { TimeTableWithID } from "~/models/time-table";

const updatedFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export type TimetableSummary = Pick<
  Partial<TimeTableWithID>,
  "department_code" | "sectionName" | "year" | "semester" | "updatedAt"
>;

export function TimetableCard({
  timetable,
  className,
}: {
  timetable: TimetableSummary;
  className?: string;
}) {
  const { department_code, year, semester, updatedAt } = timetable;

  return (
    <Link
      href={`/schedules/${department_code}/${year}/${semester}`}
      prefetch={false}
      className={cn(
        "group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring dark:bg-background",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors group-hover:text-primary">
          <CalendarRange className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-body-lg font-medium text-foreground">
            {timetable.sectionName || "Untitled section"}
          </h3>
          <p className="mt-0.5 text-body tabular-nums text-muted-foreground">
            Year {year} · Semester {semester}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-caption">
        <span className="truncate text-muted-foreground">
          {updatedAt
            ? `Updated ${updatedFormat.format(new Date(updatedAt))}`
            : "Weekly timetable"}
        </span>
        <span className="flex shrink-0 items-center gap-1 font-medium text-primary">
          View week
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

export function TimetableCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="flex justify-between border-t border-border pt-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
