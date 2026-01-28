import CourseCard from "@/components/application/course/card";
import Pagination from "@/components/application/course/pagination";
import SearchBox from "@/components/application/course/search";
import { HeaderBar } from "@/components/common/header-bar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLink } from "@/components/utils/link";
import { BookOpen, Library, Plus } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";
import { getCourses } from "~/actions/common.course";

type Props = {
  params: Promise<{
    moderator: string;
  }>;
  searchParams?: Promise<{
    query?: string;
    page?: string;
    department?: string;
    type?: string;
  }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return {
    title: `Course Catalog`,
    description: "Browse the academic curriculum, syllabus, and resources.",
  };
}

export default async function CoursesPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const filter = {
    department: searchParams?.department || "",
    type: searchParams?.type || "",
  };

  const { courses, departments, types, totalPages } = await getCourses(
    query,
    currentPage,
    filter
  );

  return (
    <div className="min-h-screen pb-20">
      {/* 1. Header with Actions */}
      <HeaderBar
        Icon={Library}
        titleNode={
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Academic Curriculum</h1>
            <Badge variant="secondary" className="rounded-full px-2.5 bg-primary/10 text-primary border-primary/20">
              {courses.length} Active Courses
            </Badge>
          </div>
        }
        descriptionNode="Manage syllabus, outcomes, and reference materials."
        actionNode={
          <div className="flex items-center gap-2">
            <ButtonLink variant="outline" size="sm" className="hidden sm:flex" href="/syllabus" target="_blank">
              <BookOpen /> Public View
            </ButtonLink>
            <ButtonLink size="sm" disabled className="gap-2 shadow-sm" href={`/${params.moderator}/courses/create`}>
              <Plus /> Create Course
            </ButtonLink>
          </div>
        }
      />

      {/* 2. Search & Filter Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Find a course</h2>
          <Suspense fallback={<Skeleton className="h-14 w-full rounded-xl" />}>
            <SearchBox departments={departments} types={types} />
          </Suspense>
        </div>
      </div>

      {/* 3. Course Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <Suspense fallback={<CourseGridSkeleton />}>
          {courses.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              No courses found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  authorized_role={params.moderator}
                />
              ))}
            </div>
          )}
        </Suspense>

        {/* 4. Pagination */}
        <div className="mt-12">
          <Suspense fallback={null}>
            {courses.length > 0 && <Pagination totalPages={totalPages} />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-[240px] rounded-xl border bg-card p-6 flex flex-col gap-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-3/4 mt-2" />
          <Skeleton className="h-4 w-1/2" />
          <div className="mt-auto flex gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}