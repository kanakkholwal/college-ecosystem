import {
  DashboardHeader,
  DashboardRoot,
  DashboardSection,
  EmptyNote,
  Panel,
  PanelSkeleton,
  PanelTitle,
  SectionError,
  ViewAllLink,
} from "@/components/application/dashboard/primitives";
import { getViewer, greeting } from "@/components/application/dashboard/viewer";
import {
  KpiCard,
  KpiGrid,
  KpiGridSkeleton,
  Sparkline,
} from "@/components/application/stats-card";
import { RouterCard } from "@/components/common/router-card";
import {
  buildWeek,
  campusNow,
  formatDuration,
  formatHour,
  slotAt,
} from "@/components/custom/time-table/week";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { getLinksByRole, quick_links } from "@/constants/links";
import { cn } from "@/lib/utils";
import {
  BedDouble,
  CalendarOff,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  Clock,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import {
  getStudentAcademics,
  getStudentActivity,
  getStudentAttendance,
  getStudentHostel,
} from "~/actions/dashboard.student";
import { changeCase } from "~/utils/string";

const ATTENDANCE_TARGET = 75;

const percent = (present: number, total: number) =>
  total > 0 ? Math.round((present / total) * 100) : null;

// Server renders in UTC; campus dates and times are always IST.
const campusFormat = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions
) =>
  new Intl.DateTimeFormat("en-IN", {
    ...options,
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));

export default async function StudentDashboard({ role }: { role: string }) {
  const viewer = await getViewer();

  return (
    <DashboardRoot>
      <DashboardHeader
        title={greeting(viewer?.name)}
        context={`${campusFormat(new Date(), { weekday: "long", day: "numeric", month: "long" })}. Here is what needs your attention today.`}
      />

      <ErrorBoundaryWithSuspense
        loadingFallback={<KpiGridSkeleton />}
        fallback={<SectionError what="Your key numbers" />}
      >
        <StudentKpis role={role} />
      </ErrorBoundaryWithSuspense>

      <DashboardSection id="today" title="Today">
        <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-5">
          <ErrorBoundaryWithSuspense
            loadingFallback={
              <PanelSkeleton className="@3xl:col-span-3" rows={4} />
            }
            fallback={<SectionError what="Today's classes" />}
          >
            <TodayClasses />
          </ErrorBoundaryWithSuspense>
          <ErrorBoundaryWithSuspense
            loadingFallback={
              <PanelSkeleton className="@3xl:col-span-2" rows={3} />
            }
            fallback={<SectionError what="Attendance" />}
          >
            <AttendancePanel role={role} />
          </ErrorBoundaryWithSuspense>
        </div>
      </DashboardSection>

      <DashboardSection id="records" title="Results and hostel">
        <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-2">
          <ErrorBoundaryWithSuspense
            loadingFallback={<PanelSkeleton rows={3} />}
            fallback={<SectionError what="Latest result" />}
          >
            <LatestResultPanel />
          </ErrorBoundaryWithSuspense>
          <ErrorBoundaryWithSuspense
            loadingFallback={<PanelSkeleton rows={3} />}
            fallback={<SectionError what="Hostel" />}
          >
            <HostelPanel role={role} />
          </ErrorBoundaryWithSuspense>
        </div>
      </DashboardSection>

      <DashboardSection
        id="community"
        title="Your community activity"
        description="Everything you have posted on the platform, all time."
      >
        <ErrorBoundaryWithSuspense
          loadingFallback={<PanelSkeleton rows={1} />}
          fallback={<SectionError what="Community activity" />}
        >
          <ActivityRow />
        </ErrorBoundaryWithSuspense>
      </DashboardSection>

      <DashboardSection id="explore" title="Explore">
        <div className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
          {getLinksByRole(role, quick_links).map((link) => (
            <RouterCard
              key={link.href}
              href={link.href}
              title={link.title}
              description={link.description}
              Icon={link.Icon}
              external={link.external}
              disabled={link.disabled}
            />
          ))}
        </div>
      </DashboardSection>
    </DashboardRoot>
  );
}

async function StudentKpis({ role }: { role: string }) {
  const [academics, attendance, hostel] = await Promise.all([
    getStudentAcademics(),
    getStudentAttendance(),
    getStudentHostel().catch(() => null),
  ]);
  const semesters = academics?.semesters ?? [];
  const latest = semesters.at(-1);
  const previous = semesters.at(-2);
  const overall = percent(attendance.present, attendance.total);
  const rank = academics?.rank.class;

  return (
    <KpiGrid>
      <KpiCard
        label="CGPI"
        value={latest ? latest.cgpi.toFixed(2) : null}
        delta={
          latest && previous
            ? {
                value: latest.cgpi - previous.cgpi,
                period: `vs semester ${previous.semester}`,
              }
            : undefined
        }
        hint={
          latest
            ? `After semester ${latest.semester}`
            : "No result published yet"
        }
        trend={semesters.length > 1 ? semesters.map((s) => s.cgpi) : undefined}
        href={academics ? `/results/${academics.rollNo}` : undefined}
      />
      <KpiCard
        label="Class rank"
        value={rank ? `#${rank}` : null}
        hint={
          academics?.rank.branch
            ? `Branch #${academics.rank.branch}, college #${academics.rank.college}`
            : "Ranks appear once results are in"
        }
      />
      <KpiCard
        label="Attendance"
        value={overall === null ? null : `${overall}%`}
        hint={
          overall === null
            ? "Start tracking a subject to see it here"
            : `${attendance.present} of ${attendance.total} classes, ${attendance.subjects.length} subjects`
        }
        href={`/${role}/attendance-personal`}
      />
      {hostel ? (
        <KpiCard
          label="Outpasses awaiting approval"
          value={hostel.pendingOutpasses}
          hint={`${hostel.activeOutpasses} approved or in use`}
          href={`/${role}/outpass`}
        />
      ) : (
        <KpiCard
          label="Latest SGPI"
          value={latest ? latest.sgpi.toFixed(2) : null}
          delta={
            latest && previous
              ? {
                  value: latest.sgpi - previous.sgpi,
                  period: `vs semester ${previous.semester}`,
                }
              : undefined
          }
          hint={
            latest ? `Semester ${latest.semester}` : "No result published yet"
          }
        />
      )}
    </KpiGrid>
  );
}

async function TodayClasses() {
  const academics = await getStudentAcademics();
  const now = campusNow();
  const today = academics?.timetable
    ? buildWeek(academics.timetable)[now.dayIndex]
    : undefined;
  const currentSlot = slotAt(now.minutes);

  return (
    <Panel as="section" className="@3xl:col-span-3">
      <PanelTitle
        meta={
          academics?.timetable && (
            <ViewAllLink
              href={academics.timetable.href}
              label="Full timetable"
            />
          )
        }
      >
        Today's classes
      </PanelTitle>
      {!academics?.timetable ? (
        <EmptyNote
          icon={<CalendarOff />}
          title="No timetable for your class yet"
          description="Your CR hasn't published one. Browse every published timetable instead."
          action={
            <ButtonLink href="/schedules" variant="outline" size="sm">
              Browse timetables
            </ButtonLink>
          }
        />
      ) : !today || today.blocks.length === 0 ? (
        <EmptyNote
          icon={<CalendarOff />}
          title="No classes today"
          description={
            today ? "Nothing is scheduled for today." : "It's the weekend."
          }
        />
      ) : (
        <ol className="flex flex-col divide-y divide-border">
          {today.blocks.map((block) => {
            const live = currentSlot >= block.start && currentSlot < block.end;
            const done = currentSlot >= block.end;
            return (
              <li
                key={`${block.start}-${block.end}`}
                className="flex items-start gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="w-20 shrink-0 text-body tabular-nums">
                  <p className="font-medium text-foreground">
                    {formatHour(block.start)}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {formatDuration(block.end - block.start)}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  {block.events.map((event) => (
                    <p
                      key={event.title}
                      className={cn(
                        "text-body text-foreground",
                        done && "text-muted-foreground"
                      )}
                    >
                      <span className="font-medium">{event.title}</span>
                      {event.heldBy && (
                        <span className="text-muted-foreground">
                          {" "}
                          with {event.heldBy}
                        </span>
                      )}
                    </p>
                  ))}
                </div>
                {live ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-caption font-medium text-primary">
                    <Clock className="size-3.5" aria-hidden="true" />
                    Now
                  </span>
                ) : done ? (
                  <span className="shrink-0 text-caption text-muted-foreground">
                    Done
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}

async function AttendancePanel({ role }: { role: string }) {
  const attendance = await getStudentAttendance();
  const subjects = attendance.subjects
    .map((s) => ({ ...s, rate: percent(s.present, s.total) }))
    .sort((a, b) => (a.rate ?? 101) - (b.rate ?? 101));
  const below = subjects.filter(
    (s) => s.rate !== null && s.rate < ATTENDANCE_TARGET
  ).length;

  return (
    <Panel as="section" className="@3xl:col-span-2">
      <PanelTitle
        meta={
          subjects.length > 0 && (
            <ViewAllLink href={`/${role}/attendance-personal`} />
          )
        }
      >
        Attendance
      </PanelTitle>
      {subjects.length === 0 ? (
        <EmptyNote
          icon={<ClipboardCheck />}
          title="No subjects tracked"
          description="Add your subjects and mark each class to keep above 75%."
          action={
            <ButtonLink
              href={`/${role}/attendance-personal`}
              variant="primary"
              size="sm"
            >
              Track attendance
            </ButtonLink>
          }
        />
      ) : (
        <>
          <p className="mb-3 text-body text-muted-foreground">
            {below > 0
              ? `${below} of ${subjects.length} subjects below ${ATTENDANCE_TARGET}%`
              : `All subjects at or above ${ATTENDANCE_TARGET}%`}
          </p>
          <ul className="flex flex-col gap-3">
            {subjects.slice(0, 4).map((s) => {
              const low = s.rate !== null && s.rate < ATTENDANCE_TARGET;
              return (
                <li key={s.id} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-body">
                    <span className="truncate text-foreground">{s.name}</span>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 tabular-nums",
                        low ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {low ? (
                        <CircleAlert className="size-3.5" aria-hidden="true" />
                      ) : (
                        <CircleCheck className="size-3.5" aria-hidden="true" />
                      )}
                      {s.rate === null ? "No classes" : `${s.rate}%`}
                      {low && <span className="sr-only">, below target</span>}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        low ? "bg-destructive" : "bg-primary"
                      )}
                      style={{ width: `${s.rate ?? 0}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Panel>
  );
}

async function LatestResultPanel() {
  const academics = await getStudentAcademics();
  const latest = academics?.semesters.at(-1);

  return (
    <Panel as="section">
      <PanelTitle
        meta={
          academics &&
          latest && (
            <ViewAllLink
              href={`/results/${academics.rollNo}`}
              label="Full result"
            />
          )
        }
      >
        Latest result
      </PanelTitle>
      {!academics || !latest ? (
        <EmptyNote
          icon={<GraduationCap />}
          title="No result yet"
          description="Results appear here once your first semester is published."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <dl className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-caption text-muted-foreground">Semester</dt>
                <dd className="font-heading text-subheading font-medium tabular-nums text-foreground">
                  {latest.semester}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-muted-foreground">SGPI</dt>
                <dd className="font-heading text-subheading font-medium tabular-nums text-foreground">
                  {latest.sgpi.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-muted-foreground">CGPI</dt>
                <dd className="font-heading text-subheading font-medium tabular-nums text-foreground">
                  {latest.cgpi.toFixed(2)}
                </dd>
              </div>
            </dl>
            <Sparkline values={academics.semesters.map((s) => s.cgpi)} />
          </div>
          <p className="text-body text-muted-foreground">
            {academics.latestCourses} courses. {academics.branch},{" "}
            {academics.programme}. Now in semester {academics.currentSemester}.
          </p>
          {academics.semesters.length > 1 && (
            <p className="sr-only">
              CGPI by semester:{" "}
              {academics.semesters
                .map((s) => `semester ${s.semester} ${s.cgpi.toFixed(2)}`)
                .join(", ")}
              .
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}

async function HostelPanel({ role }: { role: string }) {
  const hostel = await getStudentHostel();

  return (
    <Panel as="section">
      <PanelTitle
        meta={
          hostel && <ViewAllLink href={`/${role}/outpass`} label="Outpasses" />
        }
      >
        Hostel
      </PanelTitle>
      {!hostel ? (
        <EmptyNote
          icon={<BedDouble />}
          title="No hostel assigned"
          description="Contact your hostel office if you should have a room."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-body-lg font-medium text-foreground">
                {hostel.hostelName}
              </p>
              <p className="text-body text-muted-foreground">
                Room{" "}
                <span className="font-mono text-foreground">
                  {hostel.roomNumber}
                </span>
              </p>
            </div>
            {hostel.banned && (
              <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-2 py-0.5 text-caption font-medium text-destructive">
                <CircleAlert className="size-3.5" aria-hidden="true" />
                Outpasses blocked
                {hostel.bannedTill &&
                  ` until ${campusFormat(hostel.bannedTill, { day: "numeric", month: "short" })}`}
              </span>
            )}
          </div>
          {hostel.latestOutpass ? (
            <Link
              href={`/${role}/outpass/${hostel.latestOutpass.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 outline-none transition-colors duration-150 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="min-w-0">
                <span className="block text-caption text-muted-foreground">
                  Latest outpass
                </span>
                <span className="block truncate text-body text-foreground">
                  {changeCase(hostel.latestOutpass.reason, "title")},{" "}
                  {campusFormat(hostel.latestOutpass.expectedOutTime, {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-caption font-medium text-foreground">
                {changeCase(
                  hostel.latestOutpass.status.replaceAll("_", " "),
                  "title"
                )}
              </span>
            </Link>
          ) : (
            <p className="text-body text-muted-foreground">
              You haven't requested an outpass yet.
            </p>
          )}
          {!hostel.banned && (
            <div>
              <ButtonLink href={`/${role}/outpass/request`} variant="primary">
                Request outpass
              </ButtonLink>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

async function ActivityRow() {
  const activity = await getStudentActivity();
  const items = [
    { label: "Posts", value: activity.communityPostsCount, href: "/community" },
    {
      label: "Comments",
      value: activity.communityCommentsCount,
      href: "/community",
    },
    { label: "Polls", value: activity.pollsCount, href: "/polls" },
    {
      label: "Announcements",
      value: activity.announcementsCount,
      href: "/announcements",
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.label}>
          <Link
            href={item.href}
            className="flex h-full items-baseline justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring dark:bg-background"
          >
            <span className="text-body text-muted-foreground">
              {item.label}
            </span>
            <span className="font-heading text-subheading font-medium tabular-nums text-foreground">
              {item.value.toLocaleString("en-IN")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
