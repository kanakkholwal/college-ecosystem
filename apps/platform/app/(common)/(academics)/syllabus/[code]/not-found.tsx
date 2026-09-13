import { CourseBooks } from "@/components/illustrations/course-books";
import { TiltedChip } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course not found",
  description: "No course matches this code.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) items-center justify-between gap-10 px-4 py-16 md:px-6">
      <div className="flex max-w-xl flex-col items-start">
        <TiltedChip>Not found</TiltedChip>
        <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
          No course with
          <br />
          <span className="text-primary">this code</span>
        </h1>
        <p className="mt-3 text-pretty text-body text-muted-foreground md:text-body-lg">
          The course may have a different code, or it hasn't been added yet.
          Search by name to find it.
        </p>
        <div className="mt-6">
          <ButtonLink href="/syllabus" variant="primary">
            <Search />
            Search courses
          </ButtonLink>
        </div>
      </div>
      <div className="hidden w-56 shrink-0 md:block">
        <CourseBooks />
      </div>
    </div>
  );
}
