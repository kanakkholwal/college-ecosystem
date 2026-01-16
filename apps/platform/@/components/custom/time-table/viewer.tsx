import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  GraduationCap,
  Layers
} from "lucide-react";
import React from "react";
import type { EventTypeWithID, TimeTableWithID } from "src/models/time-table";
import { getDepartmentName } from "~/constants/core.departments";
import { daysMap, timeMap } from "./constants";

interface TimetableProps {
  timetableData: TimeTableWithID;
}

export default async function TimeTableViewer({
  timetableData,
}: TimetableProps) {
  const currentDayIndex = new Date().getDay() - 1;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-20 px-4 md:px-6">
      
      {/* --- 1. Header Information Card --- */}
      <div className="grid gap-6 md:grid-cols-[1fr_auto] items-start">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/5 text-primary font-mono text-[10px] uppercase tracking-wider">
                Active Schedule
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getDepartmentName(timetableData?.department_code)}
              </span>
           </div>
           <h1 className="text-3xl font-bold tracking-tight">
             {timetableData?.sectionName || "Untitled Section"}
           </h1>
           <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                 <GraduationCap className="size-4 opacity-70" />
                 <span>Year {timetableData?.year}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                 <Layers className="size-4 opacity-70" />
                 <span>Sem {timetableData?.semester}</span>
              </div>
           </div>
        </div>

        {/* Optional: Legend or Actions can go here */}
        <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground/60 border rounded-lg p-3 bg-muted/20">
           <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary" />
              <span>Academic</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-muted border" />
              <span>Free</span>
           </div>
        </div>
      </div>

      {/* --- 2. The Calendar Grid --- */}
      <Card className="overflow-hidden border-border/60 shadow-lg shadow-black/5">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="min-w-[800px]">
            {/* Grid Layout: 120px Time Column + Auto Columns */}
            <div className="grid grid-cols-[120px_1fr] auto-rows-max bg-background">
              
              {/* Corner */}
              <div className="sticky top-0 z-20 flex h-10 items-center justify-center border-b border-r bg-muted/40 text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider backdrop-blur-sm">
                <Clock className="mr-1.5 size-3.5" /> Time
              </div>

              {/* Days Header */}
              <div className="sticky top-0 z-10 grid grid-cols-7 border-b bg-muted/40 backdrop-blur-sm">
                {Array.from(daysMap.entries()).map(([index, day]) => (
                  <div
                    key={index}
                    className={cn(
                      "flex h-10 items-center justify-center border-r px-2 text-xs font-bold uppercase tracking-wider last:border-r-0",
                      currentDayIndex === index
                        ? "bg-primary/5 text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {currentDayIndex === index && (
                       <span className="mr-1.5 relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    )}
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots (Left Column) */}
              <div className="border-r bg-muted/5">
                {Array.from(timeMap.entries()).map(([index, time]) => (
                  <div
                    key={index}
                    className="flex h-28 items-center justify-center border-b px-2 text-[10px] font-medium text-muted-foreground sm:text-xs text-center leading-tight"
                  >
                    {time}
                  </div>
                ))}
              </div>

              {/* Event Cells */}
              <div className="grid grid-cols-7">
                {Array.from(timeMap.entries()).map(([timeIndex]) => (
                  <React.Fragment key={timeIndex}>
                    {Array.from(daysMap.entries()).map(([dayIndex]) => {
                      const events =
                        timetableData.schedule[dayIndex]?.timeSlots[timeIndex]
                          ?.events || [];
                      const hasEvents = events.length > 0;
                      const isToday = currentDayIndex === dayIndex;

                      return (
                        <div
                          key={`${dayIndex}-${timeIndex}`}
                          className={cn(
                            "group relative flex h-28 flex-col gap-1 border-b border-r p-1.5 transition-colors last:border-r-0",
                            isToday ? "bg-primary/[0.02]" : "bg-transparent"
                          )}
                        >
                          {hasEvents ? (
                            events.map((event, idx) => (
                              <div key={idx} className="h-full">
                                <ViewerEventCard event={event} />
                              </div>
                            ))
                          ) : (
                            // Empty State
                            <div className="h-full w-full flex items-center justify-center">
                               {/* Subtle pattern for empty slots to indicate free time */}
                               <div className="size-1 rounded-full bg-muted-foreground/10" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>
    </div>
  );
}

// --- Sub-component: Event Card for Viewer ---
function ViewerEventCard({ event }: { event: EventTypeWithID }) {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-md border border-primary/10 bg-primary/5 p-2 text-xs shadow-sm transition-all hover:border-primary/30 hover:bg-primary/10 hover:shadow-md">
      <div>
        <h4 className="font-semibold text-foreground line-clamp-2 leading-tight mb-1">
          {event.title}
        </h4>
        {event.description && (
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
      
      {event.heldBy && (
        <div className="mt-2 flex items-center gap-1.5 pt-2 border-t border-primary/10">
          <div className="flex items-center justify-center size-4 rounded-full bg-background text-primary shadow-sm">
             <Check className="size-2.5" />
          </div>
          <span className="text-[9px] font-medium text-muted-foreground truncate">
            {event.heldBy}
          </span>
        </div>
      )}
    </div>
  );
}