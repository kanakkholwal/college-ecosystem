import { EmptyNote } from "@/components/application/dashboard/primitives";
import { TimetableCardSkeleton } from "@/components/application/schedule/card";
import ScheduleSearchBox from "@/components/application/schedule/search";
import { HeaderBar } from "@/components/common/header-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  Plus,
  SearchX,
  TriangleAlert,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { cache, Suspense } from "react";
import { getAllTimeTables } from "~/actions/common.time-table";
import { getSession } from "~/auth/server";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";
import type { TimeTableWithID } from "~/models/time-table";
import { canManageTimetables } from "../access";
import { timetableEditHref } from "./paths";

export const metadata: Metadata = {
  title: "Timetables",
  description: "Create and edit class timetables for each section.",
};

type Props = {
  params: Promise<{ moderator: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type Filters = { query: string; branch: string; year: string };

// Search facets and the list read the same rows; cache() runs the query once.
const loadTimetables = cache(getAllTimeTables);

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

const updatedFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export default async function SchedulesPage(props: Props) {
  const [{ moderator }, sp, session] = await Promise.all([
    props.params,
    props.searchParams,
    getSession(),
  ]);
  const filters: Filters = {
    query: first(sp.query).toLowerCase(),
    branch: first(sp.branch),
    year: first(sp.year),
  };
  const canManage = canManageTimetables(session?.user);

  return (
    <div className="@container flex flex-col gap-8">
      <HeaderBar
        Icon={CalendarDays}
        titleNode="Timetables"
        descriptionNode={
          canManage
            ? "One timetable per section. Open one to edit its week, or add a new section."
            : "Browse section timetables. Only admins, faculty and CRs can edit them."
        }
        actionNode={
          canManage && (
            <ButtonLink
              href={`/${moderator}/schedules/create`}
              variant="primary"
            >
              <Plus />
              New timetable
            </ButtonLink>
          )
        }
      />

      <Suspense fallback={<Skeleton className="h-14 w-full rounded-2xl" />}>
        <SearchWithFilters />
      </Suspense>

      <ErrorBoundaryWithSuspense
        fallback={
          <EmptyNote
            icon={<TriangleAlert />}
            title="Timetables couldn't load"
            description="The schedule service didn't respond. Refresh the page to try again."
          />
        }
        loadingFallback={<ListSkeleton />}
      >
        <TimetableGroups
          moderator={moderator}
          filters={filters}
          canManage={canManage}
        />
      </ErrorBoundaryWithSuspense>
    </div>
  );
}

async function SearchWithFilters() {
  const timetables = await loadTimetables().catch(() => []);
  const codes = new Set(timetables.map((t) => t.department_code));
  const departments = DEPARTMENTS_LIST.filter((d) => codes.has(d.code));
  const years = Array.from(
    new Set(timetables.map((t) => t.year).filter((y) => typeof y === "number"))
  )
    .sort((a, b) => a - b)
    .map(String);

  return (
    <ScheduleSearchBox
      branches={departments.map((d) => d.code)}
      branchLabels={Object.fromEntries(
        departments.map((d) => [d.code, d.name])
      )}
      years={years}
    />
  );
}

async function TimetableGroups({
  moderator,
  filters,
  canManage,
}: {
  moderator: string;
  filters: Filters;
  canManage: boolean;
}) {
  const timetables = await loadTimetables();

  if (timetables.length === 0) {
    return (
      <EmptyNote
        icon={<CalendarRange />}
        title="No timetables yet"
        description="Start with one section: set its department, year and semester, then fill in the week."
        action={
          canManage && (
            <ButtonLink
              href={`/${moderator}/schedules/create`}
              variant="primary"
              size="sm"
            >
              <Plus />
              New timetable
            </ButtonLink>
          )
        }
      />
    );
  }

  const matches = timetables.filter((t) => {
    if (filters.branch && t.department_code !== filters.branch) return false;
    if (filters.year && String(t.year) !== filters.year) return false;
    if (!filters.query) return true;
    const dept = DEPARTMENTS_LIST.find((d) => d.code === t.department_code);
    return [t.sectionName, dept?.short, dept?.name].some((field) =>
      field?.toLowerCase().includes(filters.query)
    );
  });

  if (matches.length === 0) {
    return (
      <EmptyNote
        icon={<SearchX />}
        title="No timetables match"
        description="Check the section name, or clear a filter."
        action={
          <ButtonLink
            href={`/${moderator}/schedules`}
            variant="outline"
            size="sm"
          >
            Clear search
          </ButtonLink>
        }
      />
    );
  }

  const groups = DEPARTMENTS_LIST.map((dept) => ({
    dept,
    items: matches.filter((t) => t.department_code === dept.code),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
        <p className="text-body-lg font-medium tabular-nums text-foreground">
          {matches.length} {matches.length === 1 ? "timetable" : "timetables"}
        </p>
        <p className="text-caption tabular-nums text-muted-foreground">
          {groups.length} {groups.length === 1 ? "department" : "departments"}
          {matches.length !== timetables.length &&
            `, of ${timetables.length} in total`}
        </p>
      </div>

      {groups.map(({ dept, items }) => (
        <section
          key={dept.code}
          aria-labelledby={`dept-${dept.code}`}
          className="flex flex-col gap-3"
        >
          <div className="flex items-baseline gap-3">
            <h2
              id={`dept-${dept.code}`}
              className="text-subheading font-medium text-foreground"
            >
              {dept.name}
            </h2>
            <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-caption text-foreground">
              {dept.short}
            </span>
            <span className="ml-auto text-caption tabular-nums text-muted-foreground">
              {items.length} {items.length === 1 ? "section" : "sections"}
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3">
            {items.map((timetable) => (
              <li key={timetable._id}>
                <ManageCard
                  timetable={timetable}
                  href={timetableEditHref(moderator, timetable)}
                  canManage={canManage}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ManageCard({
  timetable,
  href,
  canManage,
}: {
  timetable: Partial<TimeTableWithID>;
  href: string;
  canManage: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring dark:bg-background"
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
            Year {timetable.year} · Semester {timetable.semester}
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-caption">
        <span className="truncate text-muted-foreground">
          {timetable.updatedAt
            ? `Updated ${updatedFormat.format(new Date(timetable.updatedAt))}`
            : "Never updated"}
        </span>
        <span className="flex shrink-0 items-center gap-1 font-medium text-primary">
          {canManage ? "Edit week" : "View week"}
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <TimetableCardSkeleton key={`skeleton-${i.toString()}`} />
        ))}
      </div>
    </div>
  );
}
