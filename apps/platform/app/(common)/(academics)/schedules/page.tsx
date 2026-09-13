import { BaseHeroSection } from "@/components/application/base-hero";
import {
  TimetableCard,
  TimetableCardSkeleton,
} from "@/components/application/schedule/card";
import ScheduleSearchBox from "@/components/application/schedule/search";
import { StackedSlabs } from "@/components/illustrations/stacked-slabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { SearchX, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { cache, Suspense } from "react";
import { getAllTimeTables } from "~/actions/common.time-table";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";

export const metadata: Metadata = {
  title: "Timetables",
  description:
    "Weekly class timetables for every department, year and semester.",
  alternates: {
    canonical: "/schedules",
  },
};

type Filters = { query: string; branch: string; year: string };

// Search box and list read the same rows; cache() dedupes the query per request.
const loadTimetables = cache(getAllTimeTables);

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

export default async function TimeTables(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const filters: Filters = {
    query: first(sp.query).toLowerCase(),
    branch: first(sp.branch),
    year: first(sp.year),
  };

  return (
    <div className="@container mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pb-12 md:px-6">
      <BaseHeroSection
        className="px-0"
        badge="Every department, every semester"
        title="Find your class"
        accent="timetable"
        description="Pick your department and year, then open your section's week. Today's classes come first."
      >
        <div className="w-full rounded-3xl border border-border bg-card/85 p-2 backdrop-blur-xl dark:bg-background/85">
          <Suspense fallback={<Skeleton className="h-14 w-full rounded-2xl" />}>
            <SearchWithFilters />
          </Suspense>
        </div>
      </BaseHeroSection>

      <ErrorBoundaryWithSuspense
        fallback={
          <EmptyState
            icon={<TriangleAlert className="size-6" aria-hidden="true" />}
            title="Timetables couldn't load"
            description="The schedule service didn't respond. Refresh the page, or try again in a minute."
          />
        }
        loadingFallback={<ListSkeleton />}
      >
        <TimetableList filters={filters} />
      </ErrorBoundaryWithSuspense>
    </div>
  );
}

async function SearchWithFilters() {
  // The list below owns the error state; the search still renders without filters.
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

async function TimetableList({ filters }: { filters: Filters }) {
  const timetables = await loadTimetables();

  if (timetables.length === 0) {
    return (
      <EmptyState
        icon={<StackedSlabs className="w-20" />}
        title="No timetables published yet"
        description="Class representatives add their section's timetable here. Check back soon."
        bare
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
      <EmptyState
        icon={<SearchX className="size-6" aria-hidden="true" />}
        title="No timetables match"
        description="Check the section name, or clear a filter to see every department."
        action={
          <ButtonLink href="/schedules" variant="outline" size="sm">
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
  const filtered = matches.length !== timetables.length;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <p className="text-body-lg font-medium text-foreground tabular-nums">
          {matches.length} {matches.length === 1 ? "timetable" : "timetables"}
        </p>
        {filtered && (
          <p className="text-caption text-muted-foreground tabular-nums">
            of {timetables.length} published
          </p>
        )}
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
          </div>
          <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
            {items.map((timetable) => (
              <li key={timetable._id}>
                <TimetableCard timetable={timetable} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <TimetableCardSkeleton key={`skeleton-${i.toString()}`} />
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
  bare = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  bare?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      {bare ? (
        icon
      ) : (
        <span className="grid size-12 place-items-center rounded-xl border border-border bg-card text-foreground">
          {icon}
        </span>
      )}
      <h2 className="mt-4 text-body-lg font-medium text-foreground">{title}</h2>
      <p className="mt-1 text-body text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
