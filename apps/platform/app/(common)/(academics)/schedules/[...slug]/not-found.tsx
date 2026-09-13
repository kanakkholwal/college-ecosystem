import { StackedSlabs } from "@/components/illustrations/stacked-slabs";
import { TiltedChip } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timetable Not Found",
  description: "No timetable exists for this department, year and semester.",
};

export default function NotFound() {
  return (
    <div className="mx-auto grid w-full max-w-(--max-app-width) grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-[1fr_16rem] md:px-6">
      <div className="flex flex-col items-start">
        <TiltedChip>Not found</TiltedChip>
        <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
          No timetable for
          <br />
          <span className="text-primary">this semester</span>
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">
          It may not be published yet, or the link has a typo. Browse the
          published timetables to find your section.
        </p>
        <div className="mt-6">
          <ButtonLink href="/schedules" variant="primary">
            <Search />
            Browse timetables
          </ButtonLink>
        </div>
      </div>
      <StackedSlabs className="mx-auto hidden max-w-56 md:block" />
    </div>
  );
}
