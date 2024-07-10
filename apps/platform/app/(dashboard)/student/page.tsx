import { getAttendanceRecords } from "src/lib/attendance/personal.actions";
import { getSession } from "src/lib/auth";
import { sessionType } from "src/types/session";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  OverallAttendanceChart,
  SubWiseAttendanceChart,
} from "./components/charts";
import { getSafeAttendance } from "./libs";

const quick_links = [
  {
    title: "Manage Attendance",
    link: "/attendance",
  },
  {
    title: "View Results",
    link: "/results",
  },
  {
    title: "View Timetables",
    link: "/schedules",
  },
  {
    title: "View Syllabus",
    link: "/syllabus",
  },
  {
    title: "View Classrooms",
    link: "/classroom-availability",
  },
];

export default async function StudentDashboard() {
  const session = (await getSession()) as sessionType;

  const attendanceRecords = await getAttendanceRecords();

  return (
    <div className="w-full mx-auto space-y-6">
      <section
        id="header"
        className="w-full mx-auto relative bg-white/20 rounded-lg p-5"
      >
        <h2 className="text-lg md:text-xl font-bold whitespace-nowrap">
          Welcome back,{" "}
          <span className="text-primary">{session.user.firstName}</span>
        </h2>
        <p className="md:text-lg font-medium text-neutral-700 dark:text-neutral-300">
          Here{`'`}s a quick overview of your Activities
        </p>
        <div className="flex items-center gap-3 flex-wrap mt-5">
          {quick_links.map((link) => {
            return (
              <Button variant="link" size="sm" key={link.title} asChild>
                <Link href={link.link}>
                  {link.title} <ArrowRight />
                </Link>
              </Button>
            );
          })}
        </div>
      </section>
      <section
        id="attendance"
        className="z-10 w-full relative flex flex-wrap items-center justify-between gap-10"
      >
        <div className="flex flex-col items-start">
          <h2 className="text-xl md:text-2xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
            Your Attendance
          </h2>
          <p className="mt-4 text-lg text-neutral-700 dark:text-neutral-300">
            Your attendance records for the current semester
          </p>
          <div
            className={cn(
              "mt-4 text-base font-medium backdrop-blur-lg py-2 px-3 rounded-full",
              getSafeAttendance(attendanceRecords).className
            )}
          >
            {getSafeAttendance(attendanceRecords).message}
          </div>
          <Button className="mt-10" asChild>
            <Link href="/attendance">
              Manage Attendance <ArrowRight />
            </Link>
          </Button>
        </div>
        <OverallAttendanceChart attendanceRecords={attendanceRecords} />
      </section>
      <div>
        <SubWiseAttendanceChart attendanceRecords={attendanceRecords} />
      </div>
    </div>
  );
}
