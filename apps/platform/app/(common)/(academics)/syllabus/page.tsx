import CourseCard from "@/components/application/course/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import { Fragment, Suspense } from "react";
import { getCourses } from "~/actions/common.course";

import { BaseHeroSection } from "@/components/application/base-hero";
import SearchBox from "@/components/application/course/search";
import Pagination from "@/components/application/course/pagination";
import AdUnit from "@/components/common/adsense";
import { ResponsiveContainer } from "@/components/common/container";
import { NoteSeparator } from "@/components/common/note-separator";
import { orgConfig } from "~/project.config";

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
  alternates: {
    canonical: "/syllabus",
  },
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
  // console.log(courses, departments, types);

  return (
    <div className="px-3 md:px-6 xl:px-12 @container">
      <BaseHeroSection
        title="Syllabus Search"
        description={`Search for syllabus of any course in ${orgConfig.shortName}.`}
      >
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <SearchBox departments={departments} types={types} />
        </Suspense>
      </BaseHeroSection>

      <NoteSeparator label={`${courses.length} Courses found`} />

      <ResponsiveContainer className="px-0 @3xl:grid-cols-3">
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
            return (<Fragment key={course.id}>
              <CourseCard
                key={course.id}
                course={course}
                className="hover:shadow-lg animate-in popup flex flex-col items-stretch justify-between"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              />
              {/* {(i + 1) % 4 === 0 && (
                <AdUnit
                  adSlot="display-square"
                  key={`ad-${course.id}`}
                />
              )} */}
            </Fragment>
            );
          })}
        </Suspense>
      </ResponsiveContainer>

      <div className="max-w-7xl mx-auto p-4">
        {courses.length > 0 ? <Pagination totalPages={totalPages} /> : null}
      </div>
      <AdUnit
        adSlot="multiplex"
        key={`syllabus-page-ad-footer`}
      />
    </div>
  );
}
