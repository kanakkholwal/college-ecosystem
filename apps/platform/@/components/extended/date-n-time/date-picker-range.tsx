"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

const DatePickerWithRangeSchema = z.object({
  from: z.preprocess(
    (arg) => (arg instanceof Date ? arg : undefined),
    z.date().refine((date) => !!date, {
      message: "A start date is required.",
    })
  ),
  to: z.preprocess(
    (arg) => (arg instanceof Date ? arg : undefined),
    z.date().refine((date) => !!date, {
      message: "An end date is required.",
    })
  ),
});

type DatePickerWithRangeType = z.infer<typeof DatePickerWithRangeSchema>;

interface DateTimePickerProps {
  field: {
    value: DatePickerWithRangeType;
    onChange: (value: DatePickerWithRangeType) => void;
  };
}

export function DatePickerWithRange({ field, ...props }: DateTimePickerProps) {
  const handleSelect = (range: DateRange) => {
    if (range?.from && range.to) {
      field.onChange({
        from: range.from,
        to: range.to,
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "w-full justify-between text-left font-normal",
            !field.value && "text-muted-foreground"
          )}
        >
          {field.value?.from ? (
            field.value.to ? (
              <>
                {format(field.value.from, "LLL dd, y")} -{" "}
                {format(field.value.to, "LLL dd, y")}
              </>
            ) : (
              format(field.value.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={field.value?.from}
          selected={field.value}
          onSelect={(range) => range && handleSelect(range)}
          numberOfMonths={2}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
