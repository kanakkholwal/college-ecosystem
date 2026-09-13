import {
  EmptyNote,
  SectionError,
} from "@/components/application/dashboard/primitives";
import {
  dayKey,
  eventStatus,
  eventTypeLabel,
  formatEventTime,
  parseDayKey,
} from "@/components/application/event/format";
import { HeaderBar } from "@/components/common/header-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import {
  CalendarDays,
  CalendarX,
  ChevronDown,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getEvents } from "~/actions/common.events";
import { EventRowMenu } from "./event-actions";
import { EventStatusTag } from "./event-status";

export const metadata: Metadata = {
  title: "Events | Admin Dashboard",
  description: "Manage the dates on the public academic calendar.",
};

type Row = {
  id: string;
  title: string;
  time: string;
  endDate: string | null;
  location?: string;
  eventType: string;
  status: ReturnType<typeof eventStatus>;
};
type MonthGroup = { key: string; rows: Row[] };

const monthLabel = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});
const tileMonth = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  month: "short",
});

function groupByMonth(rows: Row[]): MonthGroup[] {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = dayKey(row.time).slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups].map(([key, rows]) => ({ key, rows }));
}

export default function ManageEventsPage() {
  return (
    <div className="@container flex flex-col gap-8">
      <HeaderBar
        Icon={CalendarDays}
        titleNode="Events"
        descriptionNode="Everything here is public on the academic calendar. Upcoming dates come first."
        actionNode={
          <>
            <ButtonLink
              variant="outline"
              href="/academic-calendar"
              target="_blank"
              rel="noopener"
            >
              <ExternalLink aria-hidden="true" />
              Public calendar
              <span className="sr-only">(opens in a new tab)</span>
            </ButtonLink>
            <ButtonLink variant="primary" href="/admin/events/new">
              <Plus aria-hidden="true" />
              New event
            </ButtonLink>
          </>
        }
      />
      <ErrorBoundaryWithSuspense
        loadingFallback={<EventListSkeleton />}
        fallback={<SectionError what="Events" />}
      >
        <EventList />
      </ErrorBoundaryWithSuspense>
    </div>
  );
}

async function EventList() {
  const grouped = await getEvents({ from: "", to: "" });
  const now = new Date();
  const rows: Row[] = grouped
    .flatMap((group) => group.events)
    .map((event) => ({
      id: String(event.id),
      title: event.title,
      time: String(event.time),
      endDate: event.endDate ? String(event.endDate) : null,
      location: event.location,
      eventType: event.eventType,
      status: eventStatus(event, now),
    }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const current = rows.filter((row) => row.status !== "past");
  const past = rows.filter((row) => row.status === "past").reverse();

  if (rows.length === 0) {
    return (
      <EmptyNote
        icon={<CalendarX />}
        title="No events yet"
        description="Add exam weeks, holidays and campus events so students can plan ahead."
        action={
          <ButtonLink variant="primary" href="/admin/events/new">
            <Plus aria-hidden="true" />
            New event
          </ButtonLink>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <section
        aria-labelledby="current-heading"
        className="flex flex-col gap-4"
      >
        <div className="space-y-1">
          <h2
            id="current-heading"
            className="text-subheading font-medium text-foreground"
          >
            Upcoming and ongoing
          </h2>
          <p className="text-body text-muted-foreground">
            {current.length === 1 ? "1 event" : `${current.length} events`},
            soonest first.
          </p>
        </div>
        {current.length > 0 ? (
          <MonthList groups={groupByMonth(current)} />
        ) : (
          <EmptyNote
            icon={<CalendarX />}
            title="Nothing upcoming"
            description="Every event on the calendar has ended. Add the next date students should know about."
          />
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past-heading" className="flex flex-col gap-4">
          <div className="space-y-1">
            <h2
              id="past-heading"
              className="text-subheading font-medium text-foreground"
            >
              Past
            </h2>
            <p className="text-body text-muted-foreground">
              Still visible on the public calendar, most recent first.
            </p>
          </div>
          <details className="group">
            <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 self-start rounded-md text-body font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <ChevronDown
                className="size-4 transition-transform duration-150 group-open:rotate-180"
                aria-hidden="true"
              />
              <span className="group-open:hidden">
                Show {past.length} past {past.length === 1 ? "event" : "events"}
              </span>
              <span className="hidden group-open:inline">Hide past events</span>
            </summary>
            <div className="mt-4">
              <MonthList groups={groupByMonth(past)} />
            </div>
          </details>
        </section>
      )}
    </div>
  );
}

function MonthList({ groups }: { groups: MonthGroup[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {groups.map((group) => {
        const [year, month] = group.key.split("-").map(Number);
        return (
          <li
            key={group.key}
            className="overflow-hidden rounded-2xl border border-border bg-card dark:bg-background"
          >
            <h3 className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-3 text-body-lg font-medium text-foreground">
              {monthLabel.format(new Date(Date.UTC(year, month - 1, 1)))}
              <span className="text-caption font-normal text-muted-foreground tabular-nums">
                {group.rows.length === 1
                  ? "1 event"
                  : `${group.rows.length} events`}
              </span>
            </h3>
            <ul className="divide-y divide-border">
              {group.rows.map((row) => (
                <EventRow key={row.id} row={row} />
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

function EventRow({ row }: { row: Row }) {
  const key = dayKey(row.time);
  const { year, month, day } = parseDayKey(key);
  const type = eventTypeLabel(row.eventType);
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <time
        dateTime={key}
        className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border border-border"
      >
        <span className="text-caption text-muted-foreground">
          {tileMonth.format(new Date(Date.UTC(year, month, day)))}
        </span>
        <span className="text-body font-semibold leading-none text-foreground tabular-nums">
          {day}
        </span>
      </time>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h4 className="min-w-0 text-body-lg font-medium text-foreground">
            <Link
              href={`/admin/events/${row.id}`}
              className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {row.title}
            </Link>
          </h4>
          <EventStatusTag status={row.status} />
        </div>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted-foreground">
          <span className="flex items-center gap-1.5 tabular-nums">
            <Clock className="size-3.5" aria-hidden="true" />
            {formatEventTime(row)}
          </span>
          {row.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              {row.location}
            </span>
          )}
          {type && <span>{type}</span>}
        </p>
      </div>
      <EventRowMenu event={{ id: row.id, title: row.title }} />
    </li>
  );
}

function EventListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56 bg-muted" />
        <Skeleton className="h-5 w-40 bg-muted" />
      </div>
      {[3, 2].map((count) => (
        <div
          key={count}
          className="overflow-hidden rounded-2xl border border-border bg-card dark:bg-background"
        >
          <div className="border-b border-border px-4 py-3">
            <Skeleton className="h-6 w-40 bg-muted" />
          </div>
          {Array.from({ length: count }, (_, i) => (
            <div
              key={`row-${i.toString()}`}
              className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <Skeleton className="size-12 rounded-lg bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-2/3 bg-muted" />
                <Skeleton className="h-4 w-1/3 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
