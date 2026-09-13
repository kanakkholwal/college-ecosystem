import CourseCard, {
  CourseCardSkeleton,
} from "@/components/application/course/card";
import Pagination from "@/components/application/course/pagination";
import CourseSearchBox from "@/components/application/course/search";
import { EmptyNote } from "@/components/application/dashboard/primitives";
import { HeaderBar } from "@/components/common/header-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import {
  ArrowUpRight,
  Library,
  Plus,
  SearchX,
  TriangleAlert,
} from "lucide-react";
import type { Metadata } from "next";
import { cache, Suspense } from "react";
import { getCourses } from "~/actions/common.course";
import { getSession } from "~/auth/server";
import { canEditCourses } from "../access";

export const metadata: Metadata = {
  title: "Courses",
  description: "Manage course details, syllabus units and references.",
};

type Props = {
  params: Promise<{ moderator: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

// Search facets and the list read the same query; cache() runs it once per request.
const loadCourses = cache(
  (query: string, page: number, department: string, type: string) =>
    getCourses(query, page, { department, type })
);

export default async function CoursesPage(props: Props) {
  const [{ moderator }, sp, session] = await Promise.all([
    props.params,
    props.searchParams,
    getSession(),
  ]);
  const query = first(sp.query);
  const page = Math.max(1, Number.parseInt(first(sp.page), 10) || 1);
  const department = first(sp.department);
  const type = first(sp.type);
  const canEdit = canEditCourses(session?.user);

  return (
    <div className="@container flex flex-col gap-8">
      <HeaderBar
        Icon={Library}
        titleNode="Courses"
        descriptionNode={
          canEdit
            ? "Edit course details, syllabus units and references. Changes show on the public syllabus."
            : "Browse courses. Only admins, faculty and CRs can edit them."
        }
        actionNode={
          <>
            <ButtonLink href="/syllabus" variant="outline" prefetch={false}>
              Public syllabus
              <ArrowUpRight />
            </ButtonLink>
            {canEdit && (
              <ButtonLink
                href={`/${moderator}/courses/create`}
                variant="primary"
              >
                <Plus />
                New course
              </ButtonLink>
            )}
          </>
        }
      />

      <Suspense fallback={<Skeleton className="h-14 w-full rounded-2xl" />}>
        <SearchWithFacets
          query={query}
          page={page}
          department={department}
          type={type}
        />
      </Suspense>

      <ErrorBoundaryWithSuspense
        key={`${query}|${page}|${department}|${type}`}
        fallback={
          <EmptyNote
            icon={<TriangleAlert />}
            title="Courses couldn't load"
            description="The course service didn't respond. Refresh the page to try again."
          />
        }
        loadingFallback={<ListSkeleton />}
      >
        <CourseList
          moderator={moderator}
          canEdit={canEdit}
          query={query}
          page={page}
          department={department}
          type={type}
        />
      </ErrorBoundaryWithSuspense>
    </div>
  );
}

type ListArgs = {
  query: string;
  page: number;
  department: string;
  type: string;
};

async function SearchWithFacets({ query, page, department, type }: ListArgs) {
  const facets = await loadCourses(query, page, department, type).catch(
    () => null
  );
  return (
    <CourseSearchBox
      departments={facets?.departments ?? []}
      types={facets?.types ?? []}
    />
  );
}

async function CourseList({
  moderator,
  canEdit,
  ...args
}: ListArgs & { moderator: string; canEdit: boolean }) {
  const { courses, totalCount, totalPages } = await loadCourses(
    args.query,
    args.page,
    args.department,
    args.type
  );
  const filtered = Boolean(args.query || args.department || args.type);

  if (courses.length === 0) {
    return (
      <EmptyNote
        icon={<SearchX />}
        title={
          filtered || args.page > 1 ? "No courses match" : "No courses yet"
        }
        description={
          filtered
            ? "Check the name or code, or clear a filter."
            : args.page > 1
              ? `There are only ${totalPages} pages of courses.`
              : "Add the first course so students can find its syllabus."
        }
        action={
          filtered || args.page > 1 ? (
            <ButtonLink
              href={`/${moderator}/courses`}
              variant="outline"
              size="sm"
            >
              Clear search
            </ButtonLink>
          ) : (
            canEdit && (
              <ButtonLink
                href={`/${moderator}/courses/create`}
                variant="primary"
                size="sm"
              >
                <Plus />
                New course
              </ButtonLink>
            )
          )
        }
      />
    );
  }

  return (
    <section aria-labelledby="course-count" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
        <h2
          id="course-count"
          className="text-body-lg font-medium tabular-nums text-foreground"
        >
          {totalCount} {totalCount === 1 ? "course" : "courses"}
        </h2>
        {totalPages > 1 && (
          <p className="text-caption tabular-nums text-muted-foreground">
            Page {args.page} of {totalPages}
          </p>
        )}
      </div>
      <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3">
        {courses.map((course) => (
          <li key={course.id}>
            <CourseCard
              course={course}
              authorized_role={canEdit ? moderator : undefined}
            />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Suspense fallback={null}>
          <Pagination totalPages={totalPages} className="mt-4" />
        </Suspense>
      )}
    </section>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between border-b border-border pb-3">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CourseCardSkeleton key={`course-skeleton-${i.toString()}`} />
        ))}
      </div>
    </div>
  );
}
