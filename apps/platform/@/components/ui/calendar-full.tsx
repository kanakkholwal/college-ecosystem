"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Badge } from "./badge";

interface BaseEvent {
  id: string;
  title: string;
  time: Date; // ISO string or "HH:mm" format
  description: string; // Optional description field
}

interface CalendarCell<EventType extends BaseEvent> {
  day: Date;
  events: EventType[];
}

interface FullScreenCalendarProps<EventType extends BaseEvent> {
  className?: string;
  data: CalendarCell<EventType>[];
  // renderEventMarker: (event: EventType) => React.ReactNode;
  renderEventDetails?: (event: EventType) => React.ReactNode;
  onNewEvent?: (selectedDate: Date) => void;
  onNewEventRedirectPath?: string;
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];
// Renderer for full event details in the side panel
function DefaultRenderEvent<EventType extends BaseEvent>(event: EventType) {
  return (
    <div className="rounded-lg p-2 bg-muted/80 hover:shadow hover:bg-muted transition-all">
      <h3 className="text-sm font-medium">{event.title}</h3>
      <p className="text-xs text-muted-foreground">
        {format(new Date(event.time), "hh:mm a")}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
    </div>
  );
}

export function FullScreenCalendar<EventType extends BaseEvent>({
  data,
  className,
  // renderEventMarker,
  renderEventDetails = DefaultRenderEvent,
  onNewEvent,
  onNewEventRedirectPath,
  ...props
}: FullScreenCalendarProps<EventType>) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = React.useState(today);
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy")
  );
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  });

  function previousMonth() {
    const firstDayPrevMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayPrevMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"));
    setSelectedDay(today);
  }

  const eventsForDay = React.useCallback(
    (day: Date) => {
      const cell = data.find((cell) => isSameDay(cell.day, day));
      if (!cell) return [];
      return [...cell.events].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
      );
    },
    [data]
  );

  return (
    <div className={cn("flex flex-1 flex-col", className)}>
      <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="hidden w-20 flex-col items-center justify-center rounded-lg border bg-muted p-0.5 md:flex">
              <h1 className="p-1 text-xs uppercase text-muted-foreground">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-lg border bg-background p-0.5 text-lg font-bold">
                <span>{format(today, "d")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="inline-flex w-full -space-x-px border divide-x rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="ghost"
              size="icon_sm"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
              variant="ghost"
              size="sm"
            >
              Today
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="ghost"
              size="icon_sm"
              aria-label="Navigate to next month"
            >
              <ChevronRightIcon />
            </Button>
          </div>
          {onNewEvent || onNewEventRedirectPath ? (
            <>
              <Separator orientation="vertical" className="h-6 block" />

              <Button
                size="sm"
                onClick={() => {
                  onNewEvent && onNewEvent(selectedDay);
                }}
                {...(onNewEventRedirectPath
                  ? {
                      asChild: true,
                    }
                  : {})}
              >
                {onNewEventRedirectPath ? (
                  <Link
                    href={
                      onNewEventRedirectPath +
                      "?time=" +
                      format(selectedDay, "yyyy-MM-dd'T'HH:mm:ss")
                    }
                  >
                    <PlusCircleIcon />
                    <span>New Event</span>
                  </Link>
                ) : (
                  <>
                    <PlusCircleIcon />
                    <span>New Event</span>
                  </>
                )}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex-col flex lg:flex-row gap-2" suppressHydrationWarning>
        <div className="lg:flex lg:flex-auto lg:flex-col bg-card rounded-t-lg overflow-hidden">
          <div className="grid grid-cols-7 border text-center text-xs font-semibold leading-6 lg:flex-none bg-muted dark:bg-background rounded-t-lg">
            <div className="border-r py-2.5">Sun</div>
            <div className="border-r py-2.5">Mon</div>
            <div className="border-r py-2.5">Tue</div>
            <div className="border-r py-2.5">Wed</div>
            <div className="border-r py-2.5">Thu</div>
            <div className="border-r py-2.5">Fri</div>
            <div className="py-2.5">Sat</div>
          </div>

          <div className="flex text-xs leading-6 lg:flex-auto">
            <div className="hidden w-full border-x lg:grid lg:grid-cols-7 lg:grid-rows-5">
              {days.map((day, dayIdx) =>
                !isDesktop ? (
                  <button
                    onClick={() => setSelectedDay(day)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedDay(day)}
                    key={format(day, "yyyy-MM-dd")}
                    type="button"
                    className={cn(
                      isEqual(day, selectedDay) && "text-primary-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-muted-foreground",
                      (isEqual(day, selectedDay) || isToday(day)) &&
                        "font-semibold",
                      "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10"
                    )}
                  >
                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      className={cn(
                        "ml-auto flex size-6 items-center justify-center rounded-full",
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "bg-primary text-primary-foreground",
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          "bg-primary text-primary-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </time>
                    {eventsForDay(day).length > 0 && (
                      <div>
                        <div className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                          {eventsForDay(day).map((event, idx) => (
                            <span
                              key={event.id + idx}
                              className="mx-0.5 mt-1 size-1.5 rounded-full bg-muted-foreground"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-labelledby="calendar-day"
                    key={format(day, "yyyy-MM-dd")}
                    onClick={() => setSelectedDay(day)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedDay(day)}
                    className={cn(
                      dayIdx === 0 && colStartClasses[getDay(day)],
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "bg-accent/50 text-muted-foreground",
                      "relative flex flex-col border-b border-r hover:bg-muted focus:z-10",
                      !isEqual(day, selectedDay) && "hover:bg-accent/75"
                    )}
                  >
                    <header className="flex items-center justify-between p-2.5">
                      <button
                        type="button"
                        className={cn(
                          isEqual(day, selectedDay) &&
                            "text-primary-foreground",
                          !isEqual(day, selectedDay) &&
                            !isToday(day) &&
                            isSameMonth(day, firstDayCurrentMonth) &&
                            "text-foreground",
                          !isEqual(day, selectedDay) &&
                            !isToday(day) &&
                            !isSameMonth(day, firstDayCurrentMonth) &&
                            "text-muted-foreground",
                          isEqual(day, selectedDay) &&
                            isToday(day) &&
                            "border-none bg-primary",
                          isEqual(day, selectedDay) &&
                            !isToday(day) &&
                            "bg-border/50 text-foreground",
                          (isEqual(day, selectedDay) || isToday(day)) &&
                            "font-semibold",
                          "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border"
                        )}
                      >
                        <time dateTime={format(day, "yyyy-MM-dd")}>
                          {format(day, "d")}
                        </time>
                      </button>
                    </header>
                    <div className="flex-1 p-1">
                      {eventsForDay(day).length > 0 && (
                        <Badge size="sm">
                          {eventsForDay(day).length} event(s)
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="isolate grid w-full grid-cols-7 grid-rows-5 border-x lg:hidden">
              {days.map((day) => (
                <button
                  onClick={() => setSelectedDay(day)}
                  key={format(day, "yyyy-MM-dd")}
                  type="button"
                  className={cn(
                    isEqual(day, selectedDay) && "text-primary-foreground",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      isSameMonth(day, firstDayCurrentMonth) &&
                      "text-foreground",
                    !isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) &&
                      "text-muted-foreground",
                    (isEqual(day, selectedDay) || isToday(day)) &&
                      "font-semibold",
                    "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10"
                  )}
                >
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={cn(
                      "ml-auto flex size-6 items-center justify-center rounded-full",
                      isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "bg-primary text-primary-foreground",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </time>
                  {eventsForDay(day).length > 0 && (
                    <div className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                      {eventsForDay(day)
                        .slice(0, 3)
                        .map((event, idx) => (
                          <span
                            key={event.id + idx}
                            className="mx-0.5 mt-1 ml-auto size-1 rounded-full text-xs bg-primary/75"
                          />
                        ))}
                      {/* {eventsForDay(day).length > 3 && (
                        <span className="mx-0.5 mt-1 ml-auto size-1 rounded-full text-xs bg-muted-foreground">
                          +{eventsForDay(day).length - 3}
                        </span>
                      )} */}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="items-start justify-start p-3 bg-card border lg:w-88 rounded-b-lg lg:rounded-tr-lg lg:rounded-bl-none">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {format(selectedDay, "MMMM d, yyyy")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {format(selectedDay, "EEEE")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            {eventsForDay(selectedDay).length > 0 ? (
              eventsForDay(selectedDay).map((event, idx) => (
                <React.Fragment key={event.id + idx}>
                  {renderEventDetails(event)}
                </React.Fragment>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No events for this day
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
FullScreenCalendar.displayName = "FullScreenCalendar";
export type { CalendarCell, FullScreenCalendarProps };
