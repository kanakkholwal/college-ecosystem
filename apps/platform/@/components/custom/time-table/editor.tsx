"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Clock,
  Layers,
  Plus,
  Save,
  Settings2,
  Trash2
} from "lucide-react";
import React, { useRef } from "react";
import toast from "react-hot-toast";
import {
  createTimeTable,
  deleteTimeTable,
  updateTimeTable,
} from "~//actions/common.time-table";
import {
  rawTimetableSchema,
  type RawTimetableType,
} from "~/constants/common.time-table";
import { getDepartmentName } from "~/constants/core.departments";
import type { TimeTableWithID } from "~/models/time-table";
import { EditTimetableDialog, TimeTableMetaData } from "./components";
import { daysMap, rawTimetableData, timeMap } from "./constants";
import { useTimeTableStore } from "./store";

// --- Types ---
export type TimeTableEditorProps =
  | {
    timetableData: TimeTableWithID;
    mode: "edit";
  }
  | {
    timetableData?: RawTimetableType;
    mode: "create";
  };

export const TimeTableEditor: React.FC<TimeTableEditorProps> = (
  editorProps
) => {
  const isInitialized = useRef<boolean>(false);
  const setEditingEvent = useTimeTableStore((state) => state.setEditingEvent);
  const setIsEditing = useTimeTableStore((state) => state.setIsEditing);
  const setDisabled = useTimeTableStore((state) => state.setDisabled);
  const disabled = useTimeTableStore((state) => state.disabled);
  const timetableData = useTimeTableStore((state) => state.timetableData);
  const setTimetableData = useTimeTableStore((state) => state.setTimetableData);

  // --- Initialization ---
  if (!isInitialized.current) {
    setTimetableData(
      editorProps.mode === "edit" && !!editorProps.timetableData
        ? (editorProps.timetableData as TimeTableWithID)
        : (rawTimetableData as RawTimetableType)
    );
    setIsEditing(false);
    setEditingEvent({ dayIndex: 0, timeSlotIndex: 0, eventIndex: -1 });
    setDisabled(false);
    isInitialized.current = true;
  }

  // --- Handlers ---
  const handleSaveTimetable = async () => {
    setIsEditing(false);
    setDisabled(true);

    const validatedData = rawTimetableSchema.safeParse(timetableData);

    if (!validatedData.success) {
      toast.error(validatedData.error.issues[0].message);
      setDisabled(false);
      return;
    }

    const promise =
      editorProps.mode === "edit"
        ? updateTimeTable((timetableData as TimeTableWithID)?._id, timetableData as TimeTableWithID)
        : createTimeTable(validatedData.data);

    toast
      .promise(promise, {
        loading: "Saving changes...",
        success: "Timetable saved successfully",
        error: "Failed to save timetable",
      })
      .finally(() => setDisabled(false));
  };

  const handleDeleteTimetable = async () => {
    if (!(timetableData as TimeTableWithID)?._id) return;
    setDisabled(true);
    toast
      .promise(deleteTimeTable((timetableData as TimeTableWithID)._id), {
        loading: "Deleting...",
        success: "Timetable deleted",
        error: "Failed to delete",
      })
      .finally(() => setDisabled(false));
  };

  const currentDayIndex = new Date().getDay() - 1;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-20">

      {/* --- Sticky Command Bar --- */}
      <div className="sticky top-4 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/80 p-4 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
            <CalendarIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-none">
              {timetableData?.sectionName || "Untitled Schedule"}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span>{getDepartmentName(timetableData?.department_code) || "Select Dept"}</span>
              <span className="h-3 w-px bg-border" />
              <span>Sem {timetableData?.semester || "-"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {editorProps.mode === "edit" && (
            <Button
              variant="destructive"
              size="sm"
              disabled={disabled}
              onClick={handleDeleteTimetable}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSaveTimetable}
            disabled={disabled}
          >
            <Save className="mr-2 size-4" />
            {editorProps.mode === "create" ? "Create Schedule" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* --- Main Content Tabs --- */}
      <Tabs defaultValue="timetable" className="w-full space-y-6">
        <div className="flex items-center justify-between px-1">
          <TabsList className="h-9 w-full sm:w-auto">
            <TabsTrigger value="timetable" className="text-xs">
              <Layers className="mr-2 size-3.5" /> Editor
            </TabsTrigger>
            <TabsTrigger value="metadata" className="text-xs">
              <Settings2 className="mr-2 size-3.5" /> Metadata
            </TabsTrigger>
          </TabsList>

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
            <div className="flex items-center gap-1">
              <span className="block size-2 rounded-full bg-primary/20 border border-primary/50" />
              Active
            </div>
            <div className="flex items-center gap-1">
              <span className="block size-2 rounded-full bg-muted border border-border" />
              Empty
            </div>
          </div>
        </div>

        {/* --- TAB: METADATA --- */}
        <TabsContent value="metadata" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Set the basic details for this schedule.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimeTableMetaData />
            </CardContent>
          </Card>
        </TabsContent>
        {/* --- TAB: EDITOR (THE GRID) --- */}
        <TabsContent value="timetable" className="mt-0">
          <EditTimetableDialog />

          <Card className="overflow-hidden border-border/40 shadow-md">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="min-w-[800px]">
                {/* Custom Grid Implementation */}
                {/* UPDATED: Changed first column from 80px to 120px */}
                <div className="grid grid-cols-[124px_1fr] auto-rows-max">

                  {/* 1. Corner Cell (Top-Left) */}
                  <div className="sticky top-0 z-20 left-0 flex h-10 items-center justify-center border-b border-r bg-card/80 backdrop-blur-lg text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    <Clock className="mr-1.5 size-3.5" /> Time
                  </div>

                  {/* 2. Days Header (Top-Right) */}
                  <div className="sticky top-0 z-10 grid grid-cols-7 border-b bg-card/50">
                    {Array.from(daysMap.entries()).map(([index, day]) => (
                      <div
                        key={index}
                        className={cn(
                          "flex h-10 items-center justify-center border-r px-2 text-xs font-semibold uppercase tracking-wider last:border-r-0",
                          currentDayIndex === index
                            ? "bg-primary/5 text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {day}
                        {currentDayIndex === index && (
                          <span className="ml-1.5 flex h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 3. Time Slots Column (Left Sidebar) */}
                  <div className="sticky top-10 left-0 z-10 border-r bg-card/25 backdrop-blur-lg px-2">
                    {Array.from(timeMap.entries()).map(([index, time]) => (
                      <div
                        key={index}
                        className="flex h-24 items-center justify-center border-b px-2 text-[10px] font-medium text-muted-foreground sm:text-xs text-center leading-tight"
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* 4. The Main Event Grid (Right Content) */}
                  <div className="grid grid-cols-7 bg-background">
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
                              onClick={() => {
                                setIsEditing(true);
                                setEditingEvent({
                                  dayIndex,
                                  timeSlotIndex: timeIndex,
                                  eventIndex: 0,
                                });
                              }}
                              className={cn(
                                "group relative flex h-24 flex-col gap-1 border-b border-r p-1 transition-colors hover:bg-muted/40 last:border-r-0",
                                isToday && !hasEvents && "bg-primary/5 hover:bg-primary/10",
                                !hasEvents && "cursor-pointer"
                              )}
                            >
                              {hasEvents ? (
                                events.map((event, idx) => (
                                  <div
                                    key={idx}
                                    className="flex h-full w-full cursor-pointer flex-col justify-between rounded-md border border-primary/20 bg-primary/10 p-1.5 text-xs shadow-sm hover:border-primary/40 hover:bg-primary/20 transition-all"
                                  >
                                    <span className="font-semibold line-clamp-2 leading-tight text-primary">
                                      {event.title}
                                    </span>
                                    {event.description && (
                                      <span className="text-[9px] text-primary/70 line-clamp-1">
                                        {event.description}
                                      </span>
                                    )}
                                    {/* {event.heldBy && (
                                      <div className="mt-auto flex items-center gap-1 text-[9px] font-medium text-muted-foreground">
                                        <Check className="size-2.5" />
                                        <span className="truncate">
                                          {event.heldBy}
                                        </span>
                                      </div>
                                    )} */}
                                  </div>
                                ))
                              ) : (
                                // Empty State Hover
                                <div className="hidden h-full w-full items-center justify-center text-muted-foreground group-hover:flex">
                                  <div className="flex items-center gap-1 rounded-full bg-card px-2 py-1 text-[10px] shadow-sm backdrop-blur-sm border border-border/50">
                                    <Plus className="size-3" /> Add
                                  </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};