import { BaseHeroSection } from "@/components/application/base-hero";
import CourseCard, {
  CourseCardSkeleton,
} from "@/components/application/course/card";
import Pagination from "@/components/application/course/pagination";
import SearchBox from "@/components/application/course/search";
import AdUnit from "@/components/common/adsense";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ErrorBoundary,
  ErrorBoundaryWithSuspense,
} from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { SearchX, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getCourses } from "~/actions/common.course";
import { orgConfig } from "~/project.config";

// Mirrors resultsPerPage in getCourses.
const PAGE_SIZE = 32;

type Param = string | string[] | undefined;
type CoursesData = Awaited<ReturnType<typeof getCourses>>;

const first = (value: Param) => (Array.isArray(value) ? value[0] : value);

export const metadata: Metadata = {
  title: "Syllabus Search",
  description: `Search the syllabus, books and previous papers of any course at ${orgConfig.shortName}.`,
  keywords: [
    "NITH",
    "Syllabus",
    "Courses",
    "NITH Courses",
    "NITH Syllabus",
    "Syllabus Search",
    "NITH Syllabus Search",
    "NITH Courses Search",
  ],
  alternates: {
    canonical: "/syllabus",
  },
};

export default async function CoursesPage(props: {
  searchParams?: Promise<Record<string, Param>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const query = first(searchParams.query) ?? "";
  // A negative page made getCourses send a negative OFFSET, which Postgres rejects.
  const currentPage = Math.max(
    1,
    Math.floor(Number(first(searchParams.page))) || 1
  );

  // One query feeds both the filter options and the list, so both stream as soon as it settles.
  const coursesPromise = getCourses(query, currentPage, {
    department: first(searchParams.department) ?? "",
    type: first(searchParams.type) ?? "",
  });

  return (
    <div className="@container mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pb-12 md:px-6">
      <BaseHeroSection
        badge="Every course, every department"
        title="Find a course"
        accent="syllabus"
        description="Search by course name or code for its modules, books and previous papers."
      >
        <div className="w-full rounded-3xl border border-border bg-card/85 p-2 backdrop-blur-xl dark:bg-background/85">
          <ErrorBoundary fallback={<SearchBox departments={[]} types={[]} />}>
            <Suspense
              fallback={<Skeleton className="h-14 w-full rounded-2xl" />}
            >
              <SearchWithFilters coursesPromise={coursesPromise} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </BaseHeroSection>

      <ErrorBoundaryWithSuspense
        fallback={
          <EmptyState
            icon={<TriangleAlert className="size-6" aria-hidden="true" />}
            title="Courses couldn't load"
            description="The course list didn't respond. Refresh the page, or try again in a minute."
          />
        }
        loadingFallback={<CourseGridSkeleton />}
      >
        <CourseList
          coursesPromise={coursesPromise}
          currentPage={currentPage}
          filtered={Boolean(
            query || first(searchParams.department) || first(searchParams.type)
          )}
        />
      </ErrorBoundaryWithSuspense>

      <AdUnit adSlot="multiplex" key="syllabus-page-ad-footer" />
    </div>
  );
}

async function SearchWithFilters({
  coursesPromise,
}: {
  coursesPromise: Promise<CoursesData>;
}) {
  const { departments, types } = await coursesPromise;
  return <SearchBox departments={departments} types={types} />;
}

async function CourseList({
  coursesPromise,
  currentPage,
  filtered,
}: {
  coursesPromise: Promise<CoursesData>;
  currentPage: number;
  filtered: boolean;
}) {
  const { courses, totalPages } = await coursesPromise;

  if (courses.length === 0) {
    const pastEnd = totalPages > 0 && currentPage > totalPages;
    return (
      <EmptyState
        icon={<SearchX className="size-6" aria-hidden="true" />}
        title={pastEnd ? "This page is empty" : "No courses match"}
        description={
          pastEnd
            ? `There are only ${totalPages} pages of courses.`
            : "Check the course code, or clear a filter to widen the search."
        }
        action={
          pastEnd || filtered ? (
            <ButtonLink href="/syllabus" variant="outline" size="sm">
              {pastEnd ? "Back to page 1" : "Clear search"}
            </ButtonLink>
          ) : null
        }
      />
    );
  }

  // getCourses returns no total, so the heading states the exact range on this page.
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = start + courses.length - 1;

  return (
    <section aria-labelledby="courses-count" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2
          id="courses-count"
          className="text-body-lg font-medium text-foreground tabular-nums"
        >
          {totalPages <= 1
            ? `${courses.length} ${courses.length === 1 ? "course" : "courses"}`
            : `Courses ${start} to ${end}`}
        </h2>
        {totalPages > 1 && (
          <p className="text-caption text-muted-foreground tabular-nums">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
        {courses.map((course) => (
          <li key={course.id}>
            <CourseCard course={course} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Suspense fallback={<Skeleton className="h-10 w-64" />}>
            <Pagination totalPages={totalPages} />
          </Suspense>
        </div>
      )}
    </section>
  );
}

function CourseGridSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between border-b border-border pb-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <CourseCardSkeleton key={`skeleton-${i.toString()}`} />
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-xl border border-border bg-card text-foreground dark:bg-background">
        {icon}
      </span>
      <h2 className="mt-4 text-body-lg font-medium text-foreground">{title}</h2>
      <p className="mt-1 text-body text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
