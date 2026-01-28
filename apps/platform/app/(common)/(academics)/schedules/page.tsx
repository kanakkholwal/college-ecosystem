import { BaseHeroSection } from "@/components/application/base-hero";
import ScheduleSearchBox from "@/components/application/schedule/search";
import { ResponsiveContainer } from "@/components/common/container";
import EmptyArea from "@/components/common/empty-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarRange,
  GraduationCap,
  Layers,
  LayoutGrid,
  Search
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllTimeTables } from "~/actions/common.time-table";
import { getDepartmentShort } from "~/constants/core.departments";
import type { TimeTableWithID } from "~/models/time-table";

export const metadata: Metadata = {
  title: "Timetables",
  description: "Browse and access academic schedules across departments.",
  alternates: {
    canonical: "/schedules",
  },
};

export default async function TimeTables() {
  const timeTables = await getAllTimeTables();

  // Extract Filters
  const years = Array.from(
    new Set(timeTables.map((timetable) => timetable.year?.toString() || ""))
  );
  const branches = Array.from(
    new Set(timeTables.map((timetable) => timetable.department_code || ""))
  ).filter((branch) => branch !== "");

  return (
    <div className="min-h-screen pb-20">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* --- HERO SECTION --- */}
      <BaseHeroSection
        title={
          <div className="flex flex-col items-center gap-4">
            <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/20 bg-primary/5 text-primary text-xs font-medium uppercase tracking-wider">
              <CalendarRange className="mr-2 size-3" /> Academic Schedule
            </Badge>
            <span className="text-4xl md:text-5xl font-bold tracking-tight">
              Find Your <span className="text-primary">Timetable</span>
            </span>
          </div>
        }
        description="Access the latest academic schedules. Filter by department, year, or semester to find your section."
        className="pt-20 pb-12"
      >
        <ScheduleSearchBox branches={branches} years={years} />
      </BaseHeroSection>

      {/* --- RESULTS SECTION --- */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutGrid className="size-4" />
            <span>Viewing <strong>{timeTables.length}</strong> active schedules</span>
          </div>
          <Separator className="flex-1 ml-4 mr-2 max-w-[100px] opacity-50" />
        </div>

        {timeTables.length === 0 ? (
          <div className="py-20 border border-dashed rounded-xl bg-muted/20">
            <EmptyArea
              icons={[CalendarRange, Search]}
              title="No Timetables Found"
              description="There are no active timetables matching your criteria at the moment."
            />
          </div>
        ) : (
          <ResponsiveContainer className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {timeTables.map((timetable, i) => (
              <TimetableLinkCard
                key={timetable._id}
                timetable={timetable}
                index={i}
              />
            ))}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: CARD ---

function TimetableLinkCard({ timetable, index }: { timetable: Partial<TimeTableWithID>, index: number }) {
  const deptShort = getDepartmentShort(timetable.department_code as string);

  return (
    <Link
      href={`/schedules/${timetable.department_code}/${timetable.year}/${timetable.semester}`}
      className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top Row: Dept & Icon */}
      <div className="flex justify-between items-start mb-4">
        <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {deptShort || timetable.department_code}
        </Badge>

        <div className="size-8 flex items-center justify-center rounded-lg bg-background border border-border shadow-sm text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all">
          <CalendarRange className="size-4" />
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-6">
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {timetable.sectionName}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {timetable.department_code} Department
        </p>
      </div>

      {/* Footer: Metadata Grid */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 border border-transparent group-hover:border-border/50 transition-colors">
          <GraduationCap className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Year {timetable.year}</span>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 border border-transparent group-hover:border-border/50 transition-colors">
          <Layers className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Sem {timetable.semester}</span>
        </div>
      </div>


    </Link>
  )
}