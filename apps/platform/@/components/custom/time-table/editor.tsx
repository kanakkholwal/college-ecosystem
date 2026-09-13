"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  CalendarRange,
  Layers,
  Plus,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useRef } from "react";
import toast from "react-hot-toast";
import {
  createTimeTable,
  deleteTimeTable,
  updateTimeTable,
} from "~/actions/common.time-table";
import {
  type RawTimetableType,
  rawTimetableSchema,
} from "~/constants/common.time-table";
import { getDepartmentName } from "~/constants/core.departments";
import type { TimeTableWithID } from "~/models/time-table";
import { EditTimetableDialog, TimeTableMetaData } from "./components";
import { daysMap, timeMap } from "./constants";
import { useTimeTableStore } from "./store";
import { campusNow, DAY_COUNT, formatHour } from "./week";

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
  const initialize = useTimeTableStore((state) => state.initialize);
  const setEditingEvent = useTimeTableStore((state) => state.setEditingEvent);
  const setIsEditing = useTimeTableStore((state) => state.setIsEditing);
  const setDisabled = useTimeTableStore((state) => state.setDisabled);
  const disabled = useTimeTableStore((state) => state.disabled);
  const timetableData = useTimeTableStore((state) => state.timetableData);

  // Seeds the shared store before the first paint so the grid never flashes the blank template.
  if (!isInitialized.current) {
    initialize(editorProps.timetableData, editorProps.mode);
    isInitialized.current = true;
  }

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
        ? updateTimeTable(
            (timetableData as TimeTableWithID)?._id,
            timetableData as TimeTableWithID
          )
        : createTimeTable(validatedData.data);

    toast
      .promise(promise, {
        loading: "Saving changes...",
        success: "Timetable saved",
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

  const { dayIndex } = campusNow();
  const todayIndex = dayIndex < DAY_COUNT ? dayIndex : -1;
  const department = getDepartmentName(timetableData?.department_code);
  const columns = `4.5rem repeat(${daysMap.size}, minmax(0, 1fr))`;

  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col gap-6 pb-20">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center dark:bg-background">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground">
            <CalendarRange className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-body-lg font-medium text-foreground">
              {timetableData?.sectionName || "Untitled timetable"}
            </h2>
            <p className="text-caption text-muted-foreground">
              {department === "other" ? "No department" : department} · Year{" "}
              {timetableData?.year || "-"} · Semester{" "}
              {timetableData?.semester || "-"}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {editorProps.mode === "edit" && (
            <Button
              variant="destructive_soft"
              size="sm"
              disabled={disabled}
              onClick={handleDeleteTimetable}
            >
              <Trash2 />
              Delete
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveTimetable}
            disabled={disabled}
          >
            <Save />
            {editorProps.mode === "create"
              ? "Create timetable"
              : "Save changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="timetable" className="gap-1.5">
            <Layers className="size-4" aria-hidden="true" /> Week
          </TabsTrigger>
          <TabsTrigger value="metadata" className="gap-1.5">
            <Settings2 className="size-4" aria-hidden="true" /> Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metadata" className="mt-0">
          <div className="rounded-2xl border border-border bg-card p-5 dark:bg-background">
            <h3 className="text-body-lg font-medium text-foreground">
              Section details
            </h3>
            <p className="mt-1 text-body text-muted-foreground">
              Students find the timetable by department, year and semester.
            </p>
            <TimeTableMetaData className="mt-5" />
          </div>
        </TabsContent>

        <TabsContent value="timetable" className="mt-0">
          <EditTimetableDialog />
          <p className="mb-3 text-body text-muted-foreground">
            Select a slot to add or edit its classes.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card dark:bg-background">
            <div className="min-w-180">
              <div
                className="grid border-b border-border"
                style={{ gridTemplateColumns: columns }}
              >
                <span className="sr-only">Time</span>
                {Array.from(daysMap.entries()).map(([index, day]) => (
                  <div
                    key={index}
                    className={cn(
                      "flex h-11 items-center justify-center gap-2 border-l border-border text-body font-medium",
                      todayIndex === index ? "text-primary" : "text-foreground"
                    )}
                  >
                    {day}
                    {todayIndex === index && (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2 text-caption">
                        Today
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {Array.from(timeMap.keys()).map((timeIndex) => (
                <div
                  key={timeIndex}
                  className="grid border-b border-border last:border-b-0"
                  style={{ gridTemplateColumns: columns }}
                >
                  <span className="px-3 pt-2 text-right text-caption tabular-nums text-muted-foreground">
                    {formatHour(timeIndex)}
                  </span>
                  {Array.from(daysMap.entries()).map(([dayIndex, day]) => {
                    const events =
                      timetableData.schedule[dayIndex]?.timeSlots[timeIndex]
                        ?.events || [];
                    return (
                      <button
                        key={`${dayIndex}-${timeIndex}`}
                        type="button"
                        aria-label={`${day} ${formatHour(timeIndex)}: ${
                          events.length
                            ? events.map((e) => e.title).join(", ")
                            : "empty, add a class"
                        }`}
                        onClick={() => {
                          setIsEditing(true);
                          setEditingEvent({
                            dayIndex,
                            timeSlotIndex: timeIndex,
                            eventIndex: 0,
                          });
                        }}
                        className={cn(
                          "group flex min-h-20 min-w-0 flex-col gap-1 border-l border-border p-1 text-left outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                          todayIndex === dayIndex && "bg-primary/5"
                        )}
                      >
                        {events.length > 0 ? (
                          events.map((event, idx) => (
                            <span
                              key={event._id || idx}
                              className="flex min-w-0 flex-col rounded-md border border-border bg-card px-2 py-1.5 dark:bg-background"
                            >
                              <span className="line-clamp-2 text-caption font-medium text-foreground">
                                {event.title}
                              </span>
                              {event.description && (
                                <span className="line-clamp-1 text-caption text-muted-foreground">
                                  {event.description}
                                </span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="m-auto flex items-center gap-1 text-caption text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            <Plus className="size-3.5" aria-hidden="true" />
                            Add
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
