import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { getCourses } from "src/lib/course/actions";
import Pagination from "./components/pagination";
import SearchBox from "./components/search";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: {
    moderator: string;
  };
  searchParams?: {
    query?: string;
    page?: string;
    department?: string;
    type?: string;
  };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return {
    title: `Courses | ${params.moderator} Dashboard | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
    description: `Search for courses based on their name, code, department, and type.`,
  };
}

export default async function CoursesPage({ params, searchParams }: Props) {
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
    <>
      <div className="relative mb-28" id="home">
        <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-6">
          <div className="relative pt-36 ml-auto">
            <div className="lg:w-3/4 text-center mx-auto">
              <h1 className="text-gray-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">
                Courses <span className="text-primary">Search</span>
              </h1>

              <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6">
                <Suspense
                  key="SearchBox"
                  fallback={
                    <>
                      <Skeleton className="h-12 w-full " />
                    </>
                  }
                >
                  <SearchBox departments={departments} types={types} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-32 max-w-[144rem] grid lg:mb-0 lg:w-full mx-auto grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4 text-left gap-4">
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
          {courses.map((course) => {
            return (
              <Card
                key={course._id}
                variant="glass"
                className="hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription className="font-semibold">
                    {course.code}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-around items-stretch gap-3 text-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Type
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {course.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Credits
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {course.credits}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button size="sm" variant="default_light" asChild>
                    <Link href={`/${params.moderator}/courses/${course.code}`}>
                      Edit Course
                    </Link>
                  </Button>
                  <Button size="sm" variant="default" asChild>
                    <Link href={`/syllabus/${course.code}`} target="_blank">
                      View Course
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </Suspense>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-6 mt-5">
        <Suspense
          key="Pagination"
          fallback={
            <>
              <Skeleton className="h-12 w-full " />
            </>
          }
        >
          {courses.length > 0 ? <Pagination totalPages={totalPages} /> : null}
        </Suspense>
      </div>
    </>
  );
}
