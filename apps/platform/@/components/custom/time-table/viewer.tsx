import { StackedSlabs } from "@/components/illustrations/stacked-slabs";
import { BookOpen, CalendarDays, Clock, Layers } from "lucide-react";
import type { TimeTableWithID } from "src/models/time-table";
import { getDepartmentName } from "~/constants/core.departments";
import { ScheduleView } from "./schedule-view";
import { buildWeek, campusNow } from "./week";

interface TimetableProps {
  timetableData: TimeTableWithID;
}

const updatedFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/** Public read-only timetable: page header, then the week grid (day agenda on mobile). */
export default function TimeTableViewer({ timetableData }: TimetableProps) {
  const days = buildWeek(timetableData);
  const blocks = days.flatMap((d) => d.blocks);
  const weeklyHours = blocks.reduce((sum, b) => sum + b.end - b.start, 0);
  const department = getDepartmentName(timetableData.department_code);

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div className="min-w-0">
          <h1 className="text-balance text-heading-lg font-medium text-foreground">
            {timetableData.sectionName || "Untitled section"}
          </h1>
          <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-body text-muted-foreground">
            {department !== "other" && (
              <li className="flex items-center gap-1.5">
                <BookOpen className="size-4" aria-hidden="true" />
                {department}
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              Year {timetableData.year}
            </li>
            <li className="flex items-center gap-1.5">
              <Layers className="size-4" aria-hidden="true" />
              Semester {timetableData.semester}
            </li>
          </ul>
        </div>
        {blocks.length > 0 && (
          <dl className="flex items-center gap-4 text-caption text-muted-foreground">
            <div>
              <dt className="sr-only">Teaching hours per week</dt>
              <dd className="tabular-nums">
                <span className="font-medium text-foreground">
                  {weeklyHours}
                </span>{" "}
                hours a week
              </dd>
            </div>
            {timetableData.updatedAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden="true" />
                <dt className="sr-only">Last updated</dt>
                <dd>
                  Updated{" "}
                  {updatedFormat.format(new Date(timetableData.updatedAt))}
                </dd>
              </div>
            )}
          </dl>
        )}
      </header>

      <section aria-labelledby="week-heading" className="flex flex-col gap-4">
        <h2
          id="week-heading"
          className="text-heading-sm font-medium text-foreground"
        >
          Weekly schedule
        </h2>
        {blocks.length === 0 ? (
          <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-dashed border-border px-6 py-10 text-center">
            <StackedSlabs className="max-w-32" />
            <p className="mt-6 text-body-lg font-medium text-foreground">
              No classes added yet
            </p>
            <p className="mt-1 text-body text-muted-foreground">
              This section's timetable is empty. Check back once your class
              representative fills it in.
            </p>
          </div>
        ) : (
          <ScheduleView days={days} initialNow={campusNow()} />
        )}
      </section>
    </div>
  );
}
