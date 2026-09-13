"use client";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { CalendarX, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { EventCard } from "./card";
import { type EventLike, parseDayKey, toDayKey } from "./format";

export type CalendarEvent = EventLike & { id: string };
export type CalendarDay = { key: string; events: CalendarEvent[] };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthLabel = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});
const dayLabel = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

const utc = (key: string) => {
  const { year, month, day } = parseDayKey(key);
  return new Date(Date.UTC(year, month, day));
};

export function EventCalendar({
  days,
  todayKey,
  newEventHref,
}: {
  days: CalendarDay[];
  /** Today in IST, from the server, so the first render matches on both sides. */
  todayKey: string;
  newEventHref?: string;
}) {
  const today = parseDayKey(todayKey);
  const [view, setView] = useState({ year: today.year, month: today.month });
  const [selected, setSelected] = useState(todayKey);

  const byDay = useMemo(
    () => new Map(days.map((d) => [d.key, d.events])),
    [days]
  );

  const cells = useMemo(() => {
    const lead = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
    const inMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
    const total = Math.ceil((lead + inMonth) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const key = toDayKey(view.year, view.month, i - lead + 1);
      return { key, inMonth: i >= lead && i < lead + inMonth };
    });
  }, [view]);

  const shiftMonth = (by: number) =>
    setView(({ year, month }) => {
      const d = new Date(Date.UTC(year, month + by, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });

  const goToday = () => {
    setView({ year: today.year, month: today.month });
    setSelected(todayKey);
  };

  const selectedEvents = byDay.get(selected) ?? [];

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card dark:bg-background">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2
            aria-live="polite"
            className="text-subheading font-medium text-foreground"
          >
            {monthLabel.format(new Date(Date.UTC(view.year, view.month, 1)))}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon_sm"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={goToday}>
              Today
            </Button>
            <Button
              variant="outline"
              size="icon_sm"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight />
            </Button>
            {newEventHref && (
              <ButtonLink
                href={`${newEventHref}?time=${selected}T00:00:00`}
                variant="primary"
                size="sm"
              >
                <Plus />
                New event
              </ButtonLink>
            )}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="grid grid-cols-7 border-b border-border text-center text-caption text-muted-foreground"
        >
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-2">
              {d}
            </span>
          ))}
        </div>

        <ol className="grid grid-cols-7">
          {cells.map((cell) => {
            const events = byDay.get(cell.key) ?? [];
            const isSelected = cell.key === selected;
            const isToday = cell.key === todayKey;
            const { day } = parseDayKey(cell.key);
            return (
              <li
                key={cell.key}
                className="border-r border-b border-border nth-[7n]:border-r-0"
              >
                <button
                  type="button"
                  onClick={() => setSelected(cell.key)}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={`${dayLabel.format(utc(cell.key))}${isToday ? ", today" : ""}, ${
                    events.length === 1 ? "1 event" : `${events.length} events`
                  }`}
                  className={cn(
                    "flex h-14 w-full flex-col items-start gap-1 p-1.5 text-left outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:h-24 md:p-2",
                    isSelected && "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full text-caption tabular-nums",
                      cell.inMonth ? "text-foreground" : "text-muted-foreground",
                      isToday && "bg-primary font-semibold text-primary-foreground",
                      isSelected && !isToday && "border border-border-strong font-semibold"
                    )}
                  >
                    {day}
                  </span>
                  {events.length > 0 && (
                    <>
                      <span className="text-caption font-medium text-primary tabular-nums md:hidden">
                        {events.length}
                      </span>
                      <span className="hidden w-full min-w-0 flex-col gap-0.5 md:flex">
                        {events.slice(0, 2).map((event) => (
                          <span
                            key={event.id}
                            className="truncate rounded-sm bg-primary/10 px-1.5 text-caption text-foreground"
                          >
                            {event.title}
                          </span>
                        ))}
                        {events.length > 2 && (
                          <span className="px-1.5 text-caption text-muted-foreground">
                            +{events.length - 2} more
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <section
        aria-labelledby="selected-day"
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 dark:bg-background"
      >
        <h3
          id="selected-day"
          className="text-body-lg font-medium text-foreground"
        >
          {dayLabel.format(utc(selected))}
        </h3>
        {selectedEvents.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {selectedEvents.map((event) => (
              <li key={event.id}>
                <EventCard event={event} headingLevel={4} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-body text-muted-foreground">
            <CalendarX className="size-4" aria-hidden="true" />
            Nothing scheduled for this day.
          </p>
        )}
      </section>
    </div>
  );
}
