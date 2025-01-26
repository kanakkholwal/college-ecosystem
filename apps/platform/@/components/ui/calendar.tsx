"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const btnRawClassName =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap capitalize rounded-md text-sm font-semibold tracking-wide ring-offset-background transition-duration-500 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        row: "flex flex-col space-y-4 sm:space-y-0 flex w-full mt-2",
        months: "flex flex-col space-y-4 sm:space-y-0 relative",
        nav: "space-x-1 flex items-center",

        //  (single mode)
        button_previous: cn(
          "size-6 bg-slate-200 hover:bg-primary/30 rounded-lg inline-flex justify-center items-center cursor-pointer [&>svg]:hover:text-primary",
          "absolute top-1 left-3 z-10"
        ),
        button_next: cn(
          "size-6 bg-slate-200 hover:bg-primary/30 rounded-lg inline-flex justify-center items-center cursor-pointer [&>svg]:hover:text-primary",
          "absolute top-1 right-3 z-10"
        ),

        // header (single mode)
        caption: "flex justify-center pt-1 relative items-center h-8",
        caption_label: "text-sm font-medium",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          "hover:border-primary/30",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        // months (single mode)
        month_grid: "w-full border-collapse space-y-1",
        month_caption: "flex justify-center pt-1 relative items-center",
        month: "space-y-4",
        // weeks  (single mode)
        weeks: "flex flex-col space-y-1",
        week: "flex w-full space-x-1",
        weekdays: "flex w-full space-x-1",
        weekday:
          "text-muted-foreground rounded-md w-8 font-medium text-[0.8rem]",
        // days
        day: cn(
          btnRawClassName,
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100 aria-selected:border-primary/50 hover:bg-slate-200"
        ),
        outside:
          "day-outside text-gray-500 hover:bg-transparent aria-selected:text-primary/50 aria-selected:text-primary/90",
        disabled: "text-gray-400 opacity-80",
        day_hidden: "invisible",
        today:
          "text-primary border border-primary/50! font-semibold hover:text-primary !hover:border-primary/50",
        selected:
          "bg-primary/30! text-primary !hover:text-primary !hover:bg-primary/30",
        focused: "shadow-md",
        range_end: "range_end border border-primary/50 rounded-r-md",
        range_start: "range_end border border-primary/50 rounded-l-md",
        range_middle: "range_middle bg-primary/30 text-primary/90",
        ...classNames,
      }}
      components={{
        PreviousMonthButton: ({ className, ...props }) => (
          <button {...props} className={cn(className)}>
            <ChevronLeft className="size-4" />
          </button>
        ),
        NextMonthButton: ({ className, ...props }) => (
          <button {...props} className={cn(className)}>
            <ChevronRight className="size-4" />
          </button>
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
