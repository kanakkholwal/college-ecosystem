import EmptyArea from "@/components/common/empty-area";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { getDepartmentName } from "src/constants/departments";
import { getSession } from "src/lib/auth";
import { getAllTimeTables } from "src/lib/time-table/actions";
import { sessionType } from "src/types/session";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Timetables | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: `Check your schedules here.`,
};

export default async function Dashboard() {
  const session = (await getSession()) as sessionType;
  const timeTables = await getAllTimeTables();

  return (
    <>
      <section
        id="hero"
        className="z-10 w-full max-w-6xl relative flex flex-col items-center justify-center  py-24 max-h-80 text-center"
      >
        <h2
          className="text-xl md:text-2xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap"
          data-aos="fade-up"
        >
          Timetables for all departments
        </h2>
        <p
          className="mt-4 text-lg text-neutral-700 dark:text-neutral-300"
          data-aos="fade-up"
          data-aos-delay="500"
        >
          CRs and Moderators can create timetables for their respective
          departments
        </p>
      </section>
      {timeTables.length === 0 ? (
        <section className="max-w-6xl w-full xl:px-6 text-center">
          <EmptyArea
            title="No Timetables found"
            description="There are no timetables created yet. Please check back later"
          />
        </section>
      ) : (
        <section className="max-w-6xl w-full xl:px-6 grid gap-4 grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3">
          {timeTables.map((timetable, i) => {
            return (
              <Card
                variant="glass"
                key={timetable._id}
                className="hover:shadow-lg animate-in popup flex flex-col items-stretch justify-between"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <CardHeader>
                  <CardTitle>{timetable.sectionName}</CardTitle>
                  <CardDescription className="text-gray-700 font-semibold">
                    {timetable.year} Year, {timetable.semester} Semester -{" "}
                    {getDepartmentName(timetable.department_code!)}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="justify-end">
                  <Button variant="default_light" size="sm" asChild>
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
        </section>
      )}
    </>
  );
}
