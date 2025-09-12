import EmptyArea from "@/components/common/empty-area";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { GrSchedules } from "react-icons/gr";
import { getAllTimeTables } from "~//actions/common.time-table";
import { getDepartmentShort } from "~/constants/core.departments";

import { BaseHeroSection } from "@/components/application/base-hero";
import ScheduleSearchBox from "@/components/application/schedule-search";
import { ResponsiveContainer } from "@/components/common/container";
import { NoteSeparator } from "@/components/common/note-separator";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timetables",
  description: "Check your schedules here.",
  alternates: {
    canonical: "/schedules",
  },
};

export default async function TimeTables() {
  const timeTables = await getAllTimeTables();
  const years = Array.from(
    new Set(timeTables.map((timetable) => timetable.year?.toString() || ""))
  );
  const branches = Array.from(
    new Set(timeTables.map((timetable) => timetable.department_code || ""))
  ).filter((branch) => branch !== "");

  return (
    <>
      <BaseHeroSection
        title={
          <>
            Timetables <span className="text-primary">Search</span>
          </>
        }
        description="View your own timetable by selecting your department, year, and semester."
      >
        <ScheduleSearchBox branches={branches} years={years} />
      </BaseHeroSection>

      <NoteSeparator label={`${timeTables.length} Timetables found`} />

      {timeTables.length === 0 ? (
        <section className="max-w-6xl w-full px-2 xl:px-6 text-center">
          <EmptyArea
            icons={[GrSchedules]}
            title="No Timetables found"
            description="There are no timetables created yet. Please check back later"
          />
        </section>
      ) : (
        <ResponsiveContainer className="px-2 pr-3 lg:px-6 max-w-(--max-app-width) @3xl:grid-cols-3">
          {timeTables.map((timetable, i) => {
            return (
              <Card
                key={timetable._id}
                className="hover:shadow-lg animate-in popup"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">
                    {timetable.sectionName}
                  </CardTitle>
                  <div className="inline-flex items-center gap-2 flex-wrap">
                    <Badge size="sm">
                      {timetable.year}
                      <sup>
                        {timetable.year === 1
                          ? "st"
                          : timetable.year === 2
                            ? "nd"
                            : timetable.year === 3
                              ? "rd"
                              : "th"}
                      </sup>
                      Year
                    </Badge>
                    <Badge size="sm">
                      {timetable.semester}
                      <sup>
                        {timetable.semester === 1
                          ? "st"
                          : timetable.semester === 2
                            ? "nd"
                            : timetable.semester === 3
                              ? "rd"
                              : "th"}
                      </sup>
                      Semester
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="justify-between p-4 pt-0">
                  {timetable.department_code ? (
                    <Badge size="sm">
                      {getDepartmentShort(timetable.department_code as string)}
                    </Badge>
                  ) : null}
                  <Button
                    variant="default_light"
                    size="sm"
                    rounded="full"
                    effect="shineHover"
                    asChild
                  >
                    <Link
                      href={`/schedules/${timetable.department_code}/${timetable.year}/${timetable.semester}`}
                    >
                      View Timetable
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </ResponsiveContainer>
      )}
    </>
  );
}
