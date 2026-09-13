import {
  DashboardHeader,
  DashboardRoot,
  DashboardSection,
  EmptyNote,
  PanelSkeleton,
  SectionError,
} from "@/components/application/dashboard/primitives";
import { getViewer, greeting } from "@/components/application/dashboard/viewer";
import {
  KpiCard,
  KpiGrid,
  KpiGridSkeleton,
} from "@/components/application/stats-card";
import { RouterCard } from "@/components/common/router-card";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  CalendarDays,
  CalendarPlus,
  CircleCheck,
  DoorOpen,
  FilePen,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { type CrTimetableSummary, getInfo } from "~/actions/dashboard.cr";
import { getDepartmentShort } from "~/constants/core.departments";

const PREVIEW = 6;

export default async function CRDashboard({ role }: { role: string }) {
  const viewer = await getViewer();

  return (
    <DashboardRoot>
      <DashboardHeader
        title={greeting(viewer?.name)}
        context="Keep your class's timetable, rooms and notices up to date."
        actions={
          <ButtonLink href={`/${role}/schedules/create`} variant="primary">
            <CalendarPlus aria-hidden="true" />
            New timetable
          </ButtonLink>
        }
      />

      <ErrorBoundaryWithSuspense
        loadingFallback={
          <div className="flex flex-col gap-10">
            <KpiGridSkeleton count={3} />
            <PanelSkeleton rows={3} />
          </div>
        }
        fallback={<SectionError what="Your class timetables" />}
      >
        <CrOverview role={role} />
      </ErrorBoundaryWithSuspense>

      <DashboardSection id="actions" title="Class tools">
        <div className="grid grid-cols-1 gap-3 @xl:grid-cols-3">
          <RouterCard
            href={`/${role}/schedules/create`}
            title="Create timetable"
            description="Draft the weekly schedule for a section."
            Icon={CalendarPlus}
          />
          <RouterCard
            href={`/${role}/classroom`}
            title="Update room status"
            description="Mark a classroom as occupied or free."
            Icon={DoorOpen}
          />
          <RouterCard
            href="/announcements/create"
            title="Post an announcement"
            description="Share a notice with your batch."
            Icon={Megaphone}
          />
        </div>
      </DashboardSection>
    </DashboardRoot>
  );
}

async function CrOverview({ role }: { role: string }) {
  const { studentInfo, timetables, stats } = await getInfo();
  const dept = studentInfo
    ? getDepartmentShort(studentInfo.departmentCode) ||
      studentInfo.departmentCode.toUpperCase()
    : null;

  return (
    <>
      <KpiGrid className="@4xl:grid-cols-3">
        <KpiCard
          label="Timetables"
          value={stats.totalSchedules}
          hint={dept ? `${dept}, year ${studentInfo?.currentYear}` : "Class not found"}
          href={`/${role}/schedules`}
        />
        <KpiCard
          label="Drafts to publish"
          value={stats.drafts}
          hint={stats.drafts > 0 ? "Students can't see these yet" : "Nothing waiting"}
        />
        <KpiCard
          label="Last updated"
          value={
            stats.lastUpdated
              ? formatDistanceToNow(new Date(stats.lastUpdated), {
                  addSuffix: true,
                })
              : null
          }
          hint="Most recent timetable edit"
        />
      </KpiGrid>

      <DashboardSection
        id="timetables"
        title="Your class timetables"
        description={
          studentInfo
            ? `Every timetable for ${dept}, year ${studentInfo.currentYear}. Drafts first need publishing.`
            : undefined
        }
        viewAll={
          timetables.length > PREVIEW
            ? { href: `/${role}/schedules`, label: `View all ${timetables.length}` }
            : undefined
        }
      >
        {!studentInfo ? (
          <EmptyNote
            icon={<CalendarDays />}
            title="We couldn't find your class"
            description="Your academic record isn't on the platform yet, so we can't tell which timetables are yours."
          />
        ) : timetables.length === 0 ? (
          <EmptyNote
            icon={<CalendarDays />}
            title="No timetables yet"
            description="Create the timetable for your section so classmates can see it."
            action={
              <ButtonLink href={`/${role}/schedules/create`} variant="primary" size="sm">
                Create timetable
              </ButtonLink>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
            {sortForAction(timetables)
              .slice(0, PREVIEW)
              .map((t) => (
                <li key={t._id}>
                  <TimetableCard timetable={t} role={role} />
                </li>
              ))}
          </ul>
        )}
      </DashboardSection>
    </>
  );
}

function sortForAction(list: CrTimetableSummary[]) {
  const rank = (t: CrTimetableSummary) => (t.status === "published" ? 1 : 0);
  return [...list].sort((a, b) => rank(a) - rank(b));
}

function TimetableCard({
  timetable,
  role,
}: {
  timetable: CrTimetableSummary;
  role: string;
}) {
  const path = `${timetable.department_code}/${timetable.year}/${timetable.semester}`;
  const published = timetable.status === "published";
  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-body-lg font-medium text-foreground">
            {timetable.sectionName || "Untitled section"}
          </h3>
          <p className="text-body text-muted-foreground">
            Semester {timetable.semester}, year {timetable.year}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-caption font-medium",
            published
              ? "border-success/40 text-success"
              : "border-border text-muted-foreground"
          )}
        >
          {published ? (
            <CircleCheck className="size-3.5" aria-hidden="true" />
          ) : (
            <FilePen className="size-3.5" aria-hidden="true" />
          )}
          {published
            ? "Published"
            : timetable.status === "archived"
              ? "Archived"
              : "Draft"}
        </span>
      </div>
      <p className="text-caption text-muted-foreground">
        Updated{" "}
        {formatDistanceToNow(new Date(timetable.updatedAt), { addSuffix: true })}
      </p>
      <div className="mt-auto flex items-center gap-2">
        <ButtonLink href={`/${role}/schedules/${path}`} variant="outline" size="sm">
          Edit
        </ButtonLink>
        <Link
          href={`/schedules/${path}`}
          className="inline-flex h-9 items-center rounded-md px-2 text-body font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          View
        </Link>
      </div>
    </article>
  );
}
