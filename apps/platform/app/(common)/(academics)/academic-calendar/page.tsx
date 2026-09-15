import { ROLES_ENUMS } from "~/constants";
import { BaseHeroSection } from "@/components/application/base-hero";
import {
  type CalendarDay,
  EventCalendar,
} from "@/components/application/event/calendar";
import { EventCard } from "@/components/application/event/card";
import { dayKey, parseDayKey } from "@/components/application/event/format";
import AdUnit from "@/components/common/adsense";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { CalendarDays, CalendarX, List, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { getEvents } from "~/actions/common.events";
import { getSession } from "~/auth/server";

export const metadata: Metadata = {
  title: "Academic Calendar",
  description:
    "Semester dates, exams, holidays and campus events in one calendar.",
  alternates: {
    canonical: "/academic-calendar",
  },
  keywords: [
    "NITH",
    "Academic Calendar",
    "NITH Academic Calendar",
    "NITH Events",
    "NITH Important Dates",
    "NITH Calendar",
    "Academic Events",
    "College Events",
    "NITH College Events",
  ],
};

type Props = {
  searchParams: Promise<{ query?: string; from?: string; to?: string }>;
};

const monthDay = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  day: "numeric",
});
const monthShort = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  month: "short",
});
const weekdayLong = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  weekday: "long",
});

const keyToUtc = (key: string) => {
  const { year, month, day } = parseDayKey(key);
  return new Date(Date.UTC(year, month, day));
};

export default function AcademicCalendarPage({ searchParams }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pb-12 md:px-6">
      <BaseHeroSection
        badge="Semester dates, exams and holidays"
        title="Academic"
        accent="calendar"
        description="Registration, exam weeks, holidays and campus events, day by day."
      />

      <AdUnit adSlot="display-horizontal" key="academic-calendar-page-ad" />

      <ErrorBoundaryWithSuspense
        fallback={
          <StateCard
            icon={<TriangleAlert className="size-6" aria-hidden="true" />}
            title="The calendar couldn't load"
            description="The events service didn't respond. Refresh the page, or try again in a minute."
          />
        }
        loadingFallback={<CalendarSkeleton />}
      >
        <CalendarSection searchParams={searchParams} />
      </ErrorBoundaryWithSuspense>

      <AdUnit adSlot="multiplex" key="academic-calendar-page-ad-footer" />
    </div>
  );
}

async function CalendarSection({ searchParams }: Props) {
  const params = await searchParams;
  const [grouped, session] = await Promise.all([
    getEvents({
      query: params.query || "",
      from: params.from ? new Date(params.from) : "",
      to: params.to ? new Date(params.to) : "",
    }),
    getSession(),
  ]);

  const todayKey = dayKey(new Date());
  const days: CalendarDay[] = grouped.map((group) => ({
    key: dayKey(group.day),
    events: group.events
      .map((event) => ({
        id: String(event.id),
        title: event.title,
        description: event.description,
        time: event.time,
        endDate: event.endDate ?? null,
        location: event.location,
        eventType: event.eventType,
        links: event.links,
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
  }));
  // Keys sort lexically as dates; today's and still-running events count as upcoming.
  const upcoming = days.flatMap((d) => {
    if (d.key >= todayKey) return [d];
    const running = d.events.filter(
      (e) => e.endDate && dayKey(e.endDate) >= todayKey
    );
    return running.length > 0 ? [{ ...d, events: running }] : [];
  });

  return (
    <Tabs defaultValue="calendar" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <p className="text-body text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {upcoming.reduce((n, d) => n + d.events.length, 0)}
          </span>{" "}
          upcoming events
        </p>
        <TabsList className="h-10">
          <TabsTrigger value="calendar" className="h-8 gap-1.5">
            <CalendarDays className="size-4" aria-hidden="true" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="h-8 gap-1.5">
            <List className="size-4" aria-hidden="true" />
            Upcoming
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="calendar" className="mt-0">
        <EventCalendar
          days={days}
          todayKey={todayKey}
          newEventHref={
            session?.user?.role === ROLES_ENUMS.ADMIN
              ? "/admin/events/new"
              : undefined
          }
        />
      </TabsContent>

      <TabsContent value="list" className="mt-0">
        <h2 className="sr-only">Upcoming events</h2>
        {upcoming.length === 0 ? (
          <StateCard
            icon={<CalendarX className="size-6" aria-hidden="true" />}
            title="Nothing upcoming yet"
            description="No future dates have been added. Past events stay in the calendar view."
          />
        ) : (
          <ol className="flex flex-col gap-3">
            {upcoming.map((day) => {
              const date = keyToUtc(day.key);
              return (
                <li
                  key={day.key}
                  className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[10rem_minmax(0,1fr)] dark:bg-background"
                >
                  <div className="flex items-center gap-3 sm:items-start">
                    <span
                      aria-hidden="true"
                      className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border border-border"
                    >
                      <span className="text-caption text-muted-foreground">
                        {monthShort.format(date)}
                      </span>
                      <span className="text-body font-semibold leading-none text-foreground tabular-nums">
                        {monthDay.format(date)}
                      </span>
                    </span>
                    <h3 className="text-body font-medium text-foreground">
                      <time dateTime={day.key}>
                        <span className="sr-only">
                          {monthDay.format(date)} {monthShort.format(date)},{" "}
                        </span>
                        {weekdayLong.format(date)}
                      </time>
                      {day.key === todayKey && (
                        <span className="block text-caption font-medium text-primary">
                          Today
                        </span>
                      )}
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {day.events.map((event) => (
                      <li key={event.id}>
                        <EventCard event={event} headingLevel={4} />
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        )}
      </TabsContent>
    </Tabs>
  );
}

function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-52 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card dark:bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="h-9 border-b border-border" />
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={`cell-${i.toString()}`}
                className="h-14 border-r border-b border-border p-1.5 nth-[7n]:border-r-0 md:h-24 md:p-2"
              >
                <Skeleton className="size-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 dark:bg-background">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function StateCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-xl border border-border bg-card text-foreground dark:bg-background">
        {icon}
      </span>
      <h2 className="mt-4 text-body-lg font-medium text-foreground">{title}</h2>
      <p className="mt-1 text-body text-muted-foreground">{description}</p>
    </div>
  );
}
