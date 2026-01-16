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
import type { Matcher } from "react-day-picker";

const DatePickerFormSchema = z.preprocess(
  (arg) => (arg instanceof Date ? arg : undefined),
  z.date().refine((date) => !isNaN(date.getTime()), {
    message: "A date and time is required.",
  })
);
type DatePickerType = z.infer<typeof DatePickerFormSchema>;

interface DateTimePickerTypeProps {
  disabled?: Matcher | Matcher[] | undefined;
  value: DatePickerType;
  onChange: (value: DatePickerType) => void;
}

export function DatePicker(field: DateTimePickerTypeProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full pl-3 text-left font-normal",
            !field.value && "text-muted-foreground"
          )}
        >
          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          required={true}
          selected={field.value}
          onSelect={field.onChange}
          disabled={field.disabled}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
