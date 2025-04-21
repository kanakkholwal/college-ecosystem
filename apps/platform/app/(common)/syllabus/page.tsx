import CourseCard from "@/components/application/course-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getCourses } from "~/actions/course";

import Pagination from "@/components/application/course-pagination";
import SearchBox from "@/components/application/course-search";

export const metadata: Metadata = {
  title: "Syllabus Search",
  description: "Search for syllabus of any course in NITH",
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
};
export default async function CoursesPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    department?: string;
    type?: string;
  }>;
}) {
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
  console.log(courses, departments, types);

  return (
    <div className="px-4 md:px-12 xl:px-6 @container">
      <section
        id="hero"
        className="z-10 w-full mx-auto max-w-6xl relative flex flex-col items-center justify-center py-24 max-h-80 text-center"
      >
        <h2
          className="text-2xl lg:text-4xl font-bold whitespace-nowrap"
          data-aos="fade-up"
        >
          Syllabus <span className="text-primary">Search</span>
        </h2>
        <p
          className="mt-4 text-muted-foreground"
          data-aos="zoom-in"
        >
          Search for syllabus of any course in NITH
        </p>
        <div
          className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6 w-full mx-auto max-w-2xl"
          data-aos="fade-up"
          data-aos-anchor-placement="center-bottom"
        >
          <Suspense fallback={<Skeleton className="h-12 w-full" />}>
            <SearchBox departments={departments} types={types} />
          </Suspense>
        </div>
      </section>
      <div className="max-w-6xl mx-auto w-full xl:px-6 grid gap-4 grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 @5xl:grid-cols-4">
        <Suspense
          key="Courses"
          fallback={
            <>
              <Skeleton className="h-12 w-full " />
              <Skeleton className="h-12 w-full " />
              <Skeleton className="h-12 w-full " />
            </>
          }
        >
          {courses.map((course, i) => {
            return (
              <CourseCard
                key={course.id}
                course={course}
                className="hover:shadow-lg animate-in popup flex flex-col items-stretch justify-between"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              />
            );
          })}
        </Suspense>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {courses.length > 0 ? <Pagination totalPages={totalPages} /> : null}
      </div>
    </div>
  );
}
