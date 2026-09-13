"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Coffee, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type CampusTime,
  type ClassBlock,
  type ClassEvent,
  campusNow,
  type DayPlan,
  DAY_COUNT,
  FIRST_HOUR,
  formatDuration,
  formatHour,
  slotAt,
} from "./week";

const ROW_REM = 5;

function useCampusClock(initial: CampusTime) {
  const [now, setNow] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => setNow(campusNow()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const contains = (block: ClassBlock, slot: number) =>
  block.start <= slot && slot < block.end;

/** Week grid from `md`, a day switcher with an agenda below it. Today is selected by default. */
export function ScheduleView({
  days,
  initialNow,
}: {
  days: DayPlan[];
  initialNow: CampusTime;
}) {
  const now = useCampusClock(initialNow);
  const todayIndex = now.dayIndex < DAY_COUNT ? now.dayIndex : -1;
  const currentSlot = todayIndex === -1 ? -1 : slotAt(now.minutes);
  const [selected, setSelected] = useState(Math.max(todayIndex, 0));

  return (
    <div className="flex flex-col gap-4">
      <NowNext
        today={todayIndex === -1 ? undefined : days[todayIndex]}
        currentSlot={currentSlot}
      />

      <div className="flex flex-col gap-4 md:hidden">
        <DaySwitcher
          days={days}
          selected={selected}
          todayIndex={todayIndex}
          onSelect={setSelected}
        />
        <DayAgenda
          day={days[selected]}
          currentSlot={selected === todayIndex ? currentSlot : -1}
        />
      </div>

      <WeekGrid
        days={days}
        todayIndex={todayIndex}
        currentSlot={currentSlot}
        minutes={now.minutes}
      />
    </div>
  );
}

function NowNext({
  today,
  currentSlot,
}: {
  today?: DayPlan;
  currentSlot: number;
}) {
  let text: React.ReactNode;
  if (!today) {
    text = "No classes today, it's the weekend.";
  } else {
    const current = today.blocks.find((b) => contains(b, currentSlot));
    const next = today.blocks.find((b) => b.start > currentSlot);
    if (current) {
      text = (
        <>
          <span className="font-medium text-primary">Now</span>{" "}
          <span className="font-medium text-foreground">
            {current.events.map((e) => e.title).join(", ")}
          </span>{" "}
          until {formatHour(current.end)}
        </>
      );
    } else if (next) {
      text = (
        <>
          <span className="font-medium text-foreground">Next</span>{" "}
          <span className="font-medium text-foreground">
            {next.events.map((e) => e.title).join(", ")}
          </span>{" "}
          at {formatHour(next.start)}
        </>
      );
    } else {
      text =
        today.blocks.length > 0
          ? "No more classes today."
          : "No classes today.";
    }
  }

  return (
    <p
      aria-live="polite"
      className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-body text-muted-foreground dark:bg-background"
    >
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full bg-primary"
      />
      <span className="min-w-0">{text}</span>
    </p>
  );
}

function DaySwitcher({
  days,
  selected,
  todayIndex,
  onSelect,
}: {
  days: DayPlan[];
  selected: number;
  todayIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <fieldset className="grid grid-cols-5 gap-1 rounded-2xl border border-border bg-card p-1 dark:bg-background">
      <legend className="sr-only">Choose a day</legend>
      {days.map((day) => {
        const active = day.index === selected;
        const isToday = day.index === todayIndex;
        const count = day.blocks.length;
        return (
          <button
            key={day.index}
            type="button"
            aria-pressed={active}
            aria-label={`${day.label}${isToday ? ", today" : ""}, ${count} ${count === 1 ? "class" : "classes"}`}
            onClick={() => onSelect(day.index)}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <span className="text-body font-medium">
              {day.label.slice(0, 3)}
            </span>
            <span
              className={cn(
                "text-caption tabular-nums",
                active
                  ? "text-primary-foreground"
                  : isToday
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
              )}
            >
              {isToday ? "Today" : count === 0 ? "Free" : count}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}

function DayAgenda({
  day,
  currentSlot,
}: {
  day: DayPlan;
  currentSlot: number;
}) {
  if (day.blocks.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-10 text-center">
        <Coffee className="size-5 text-muted-foreground" aria-hidden="true" />
        <p className="mt-2 text-body-lg font-medium text-foreground">
          No classes on {day.label}
        </p>
      </div>
    );
  }

  return (
    <ol aria-label={`${day.label} classes`} className="flex flex-col gap-2">
      {day.blocks.map((block, i) => {
        const prev = day.blocks[i - 1];
        const gap = prev ? block.start - prev.end : 0;
        return (
          <li key={block.start} className="flex flex-col gap-2">
            {gap > 0 && (
              <p className="ml-20 flex h-9 items-center gap-2 rounded-lg border border-dashed border-border px-3 text-caption text-muted-foreground">
                <Coffee className="size-3.5" aria-hidden="true" />
                Free for {formatDuration(gap)}
              </p>
            )}
            <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-3">
              <p className="flex flex-col items-end pt-4 text-right">
                <span className="text-body font-medium tabular-nums text-foreground">
                  {formatHour(block.start)}
                </span>
                <span className="text-caption tabular-nums text-muted-foreground">
                  <span className="sr-only">to </span>
                  {formatHour(block.end)}
                </span>
              </p>
              <AgendaCard block={block} isNow={contains(block, currentSlot)} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function AgendaCard({ block, isNow }: { block: ClassBlock; isNow: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col divide-y divide-border rounded-2xl border bg-card dark:bg-background",
        isNow ? "border-primary" : "border-border"
      )}
    >
      {block.events.map((event, i) => (
        <div key={`${event.title}-${i.toString()}`} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 text-body-lg font-medium text-foreground">
              {event.title}
            </h3>
            {isNow && i === 0 && <NowTag />}
          </div>
          <EventMeta event={event} clamp />
        </div>
      ))}
    </div>
  );
}

function EventMeta({ event, clamp }: { event: ClassEvent; clamp?: boolean }) {
  const [open, setOpen] = useState(false);
  const long = clamp && (event.description?.length ?? 0) > 90;
  if (!event.description && !event.heldBy) return null;

  return (
    <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
      {event.description && (
        <p
          className={cn(
            "text-body text-muted-foreground",
            long && !open && "line-clamp-2"
          )}
        >
          {event.description}
        </p>
      )}
      {long && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="-my-1 h-8 w-fit rounded-md text-caption font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}
      {event.heldBy && (
        <p className="flex items-center gap-1.5 text-body text-foreground">
          <UserRound
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">Faculty: </span>
          {event.heldBy}
        </p>
      )}
    </div>
  );
}

function NowTag() {
  return (
    <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 text-caption font-medium text-primary">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
      Now
    </span>
  );
}

function WeekGrid({
  days,
  todayIndex,
  currentSlot,
  minutes,
}: {
  days: DayPlan[];
  todayIndex: number;
  currentSlot: number;
  minutes: number;
}) {
  const blocks = days.flatMap((d) => d.blocks);
  if (blocks.length === 0) return null;
  const first = Math.min(...blocks.map((b) => b.start));
  const last = Math.max(...blocks.map((b) => b.end));
  const rows = Array.from({ length: last - first }, (_, i) => first + i);
  const columns = `4.5rem repeat(${days.length}, minmax(0, 1fr))`;
  const lineOffset = (minutes / 60 - FIRST_HOUR - first) * ROW_REM;
  const showLine =
    todayIndex !== -1 && lineOffset >= 0 && lineOffset <= rows.length * ROW_REM;

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block dark:bg-background">
      <div
        className="grid border-b border-border"
        style={{ gridTemplateColumns: columns }}
      >
        <span className="sr-only">Time</span>
        {days.map((day) => {
          const isToday = day.index === todayIndex;
          return (
            <div
              key={day.index}
              className={cn(
                "flex h-12 items-center justify-center gap-2 border-l border-border px-2 text-body font-medium",
                isToday ? "text-primary" : "text-foreground"
              )}
            >
              <span className="lg:hidden">{day.label.slice(0, 3)}</span>
              <span className="hidden lg:inline">{day.label}</span>
              {isToday && (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 text-caption">
                  Today
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="relative grid"
        style={{
          gridTemplateColumns: columns,
          gridTemplateRows: `repeat(${rows.length}, ${ROW_REM}rem)`,
        }}
      >
        {rows.map((slot, r) => (
          <span
            key={`time-${slot}`}
            className="px-3 pt-2 text-right text-caption tabular-nums text-muted-foreground"
            style={{ gridColumn: 1, gridRow: r + 1 }}
          >
            {formatHour(slot)}
          </span>
        ))}
        {days.map((day) =>
          rows.map((slot, r) => (
            <div
              key={`cell-${day.index}-${slot}`}
              aria-hidden="true"
              className={cn(
                "border-l border-border",
                r > 0 && "border-t",
                day.index === todayIndex && "bg-primary/5"
              )}
              style={{ gridColumn: day.index + 2, gridRow: r + 1 }}
            />
          ))
        )}
        {days.map((day) =>
          day.blocks.map((block) => (
            <GridBlock
              key={`block-${day.index}-${block.start}`}
              day={day}
              block={block}
              isNow={day.index === todayIndex && contains(block, currentSlot)}
              style={{
                gridColumn: day.index + 2,
                gridRow: `${block.start - first + 1} / span ${block.end - block.start}`,
              }}
            />
          ))
        )}
        {showLine && (
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-20"
            style={{ gridColumn: todayIndex + 2, gridRow: "1 / -1" }}
          >
            <div
              className="absolute inset-x-0 h-0.5 bg-primary"
              style={{ top: `${lineOffset}rem` }}
            >
              <span className="absolute -top-1 -left-1 size-2.5 rounded-full bg-primary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GridBlock({
  day,
  block,
  isNow,
  style,
}: {
  day: DayPlan;
  block: ClassBlock;
  isNow: boolean;
  style: React.CSSProperties;
}) {
  const [primary, ...rest] = block.events;
  const span = block.end - block.start;
  const time = `${formatHour(block.start)} to ${formatHour(block.end)}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${day.label}, ${time}: ${block.events.map((e) => e.title).join(", ")}${isNow ? ", now" : ""}`}
          className={cn(
            "relative z-10 m-1 flex min-w-0 flex-col items-start overflow-hidden rounded-lg border bg-card p-2 text-left outline-none transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-border-strong dark:bg-background",
            isNow ? "border-primary" : "border-border"
          )}
          style={style}
        >
          <span className="line-clamp-2 text-body font-medium text-foreground">
            {primary.title}
          </span>
          <span className="line-clamp-1 text-caption text-muted-foreground">
            {rest.length > 0
              ? `+${rest.length} more`
              : (primary.description ?? primary.heldBy ?? time)}
          </span>
          {span > 1 && primary.heldBy && primary.description && (
            <span className="mt-1 line-clamp-1 text-caption text-muted-foreground">
              {primary.heldBy}
            </span>
          )}
          {isNow && (
            <span className="mt-auto text-caption font-medium text-primary">
              Now
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 rounded-2xl border-border bg-card p-0 shadow-lg dark:bg-background"
      >
        <p className="border-b border-border px-4 py-3 text-caption tabular-nums text-muted-foreground">
          {day.label} · {time} · {formatDuration(span)}
        </p>
        <div className="flex max-h-80 flex-col divide-y divide-border overflow-y-auto">
          {block.events.map((event, i) => (
            <div key={`${event.title}-${i.toString()}`} className="px-4 py-3">
              <h3 className="text-body-lg font-medium text-foreground">
                {event.title}
              </h3>
              <EventMeta event={event} />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
