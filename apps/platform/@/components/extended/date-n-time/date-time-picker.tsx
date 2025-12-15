"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import * as React from "react";

interface DateTimePickerProps {
  value?: string | Date;
  onChange: (date: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  className,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [isOpen, setIsOpen] = React.useState(false);

  // Sync internal state if prop changes
  React.useEffect(() => {
    if (value) setDate(new Date(value));
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    // Preserve time if it exists, otherwise default to current time
    const newDate = new Date(selectedDate);
    if (date) {
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
    } else {
        const now = new Date();
        newDate.setHours(now.getHours());
        newDate.setMinutes(now.getMinutes());
    }
    
    setDate(newDate);
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (type: "hour" | "minute" | "ampm", val: string) => {
    if (!date) return;
    const newDate = new Date(date);
    
    if (type === "hour") {
      const currentHours = newDate.getHours();
      const isPM = currentHours >= 12;
      let newHour = parseInt(val);
      
      if (isPM && newHour !== 12) newHour += 12;
      if (!isPM && newHour === 12) newHour = 0;
      
      newDate.setHours(newHour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(val));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      if (val === "AM" && currentHours >= 12) newDate.setHours(currentHours - 12);
      if (val === "PM" && currentHours < 12) newDate.setHours(currentHours + 12);
    }

    setDate(newDate);
    onChange(newDate.toISOString());
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          transition="none"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
          {date ? (
            <span className="flex items-center gap-2">
                <span>{format(date, "PPP")}</span>
                <span className="text-muted-foreground">at</span>
                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{format(date, "hh:mm aa")}</span>
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex min-h-[300px] max-h-[400px] divide-x divide-border/50">
          
          {/* Calendar Section */}
          <div className="p-3">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              className="p-0"
            />
          </div>

          {/* Time Picker Section */}
          <div className="flex flex-col w-[160px] max-h-[300px] h-full bg-muted/10">
            <div className="flex items-center justify-center h-10 border-b border-border/50 bg-muted/30">
                <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Time</span>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Hours */}
              <ScrollArea className="flex-1 border-r border-border/30">
                <div className="flex flex-col p-1 gap-0.5">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <TimeButton
                      key={h}
                      active={date ? parseInt(format(date, "h")) === h : false}
                      onClick={() => handleTimeChange("hour", h.toString())}
                    >
                      {h}
                    </TimeButton>
                  ))}
                </div>
                <ScrollBar className="w-0" />
              </ScrollArea>

              {/* Minutes */}
              <ScrollArea className="flex-1 border-r border-border/30">
                <div className="flex flex-col p-1 gap-0.5">
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                    <TimeButton
                      key={m}
                      active={date ? date.getMinutes() === m : false}
                      onClick={() => handleTimeChange("minute", m.toString())}
                    >
                      {m.toString().padStart(2, "0")}
                    </TimeButton>
                  ))}
                </div>
                <ScrollBar className="w-0" />
              </ScrollArea>

              {/* AM/PM */}
              <ScrollArea className="flex-1">
                <div className="flex flex-col p-1 gap-0.5 h-full">
                  {["AM", "PM"].map((period) => (
                    <TimeButton
                      key={period}
                      active={date ? format(date, "a") === period : false}
                      onClick={() => handleTimeChange("ampm", period)}
                      className="h-full flex-1"
                    >
                      {period}
                    </TimeButton>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// --- Helper Button ---
function TimeButton({ 
    active, 
    children, 
    onClick, 
    className ,
    size = "icon_sm",
    ...props
}: { 
    active: boolean; 
    children: React.ReactNode; 
    onClick: () => void;
    className?: string;
} & React.ComponentPropsWithoutRef<typeof Button>

) {
    return (
        <Button
            type="button"
            size={size}
            variant={active ? "default_soft" :"ghost"}
            {...props}
            onClick={onClick}
            className={cn(
                className
            )}
        >
            {children}
        </Button>
    )
}