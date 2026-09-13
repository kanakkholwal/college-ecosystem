"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarClock, Check, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import type { RawEvent } from "~/constants/common.time-table";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";
import { daysMap } from "./constants";
import { useTimeTableStore } from "./store";
import { formatHour } from "./week";

const blankEvent = (): RawEvent => ({
  _id: nanoid(),
  title: "",
  description: "",
  heldBy: "",
});

export const EditTimetableDialog: React.FC = () => {
  const {
    timetableData,
    editingEvent,
    isEditing,
    setIsEditing,
    setEditingEvent,
    updateEvent,
    deleteEvent,
  } = useTimeTableStore();

  const [newEvent, setNewEvent] = useState<RawEvent>(blankEvent);

  useEffect(() => {
    const event =
      timetableData.schedule[editingEvent.dayIndex]?.timeSlots[
        editingEvent.timeSlotIndex
      ]?.events[editingEvent.eventIndex];
    setNewEvent(isEditing && event ? event : blankEvent());
  }, [isEditing, editingEvent, timetableData.schedule]);

  const handleEventChange = (field: keyof RawEvent, value: string) => {
    setNewEvent((prev) => ({ ...prev, [field]: value }));
  };

  const currentEvents =
    timetableData.schedule[editingEvent.dayIndex]?.timeSlots[
      editingEvent.timeSlotIndex
    ]?.events || [];
  const isCreatingNew = editingEvent.eventIndex >= currentEvents.length;
  const slotLabel = `${daysMap.get(editingEvent.dayIndex) ?? ""}, ${formatHour(
    editingEvent.timeSlotIndex
  )} to ${formatHour(editingEvent.timeSlotIndex + 1)}`;

  return (
    <Sheet open={isEditing} onOpenChange={setIsEditing}>
      <SheetContent className="flex h-full w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground">
              <CalendarClock className="size-5" aria-hidden="true" />
            </span>
            <div>
              <SheetTitle>
                {isCreatingNew ? "Add a class" : "Edit class"}
              </SheetTitle>
              <SheetDescription className="text-caption">
                {slotLabel}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto py-6">
          {currentEvents.length > 0 && (
            <div className="space-y-2">
              <p className="text-caption font-medium text-muted-foreground">
                In this slot
              </p>
              <div className="flex flex-col gap-2">
                {currentEvents.map((event, idx) => {
                  const active = editingEvent.eventIndex === idx;
                  return (
                    <button
                      type="button"
                      key={event?._id || idx}
                      aria-pressed={active}
                      onClick={() =>
                        setEditingEvent({ ...editingEvent, eventIndex: idx })
                      }
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-3 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                        active ? "border-primary" : "border-border"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body font-medium text-foreground">
                          {event.title}
                        </p>
                        <p className="truncate text-caption text-muted-foreground">
                          {[event.description, (event as RawEvent).heldBy]
                            .filter(Boolean)
                            .join(" · ") || "No details"}
                        </p>
                      </div>
                      {active && (
                        <Check
                          className="size-4 text-primary"
                          aria-label="Editing"
                        />
                      )}
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={isCreatingNew}
                  onClick={() =>
                    setEditingEvent({
                      ...editingEvent,
                      eventIndex: currentEvents.length,
                    })
                  }
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 rounded-lg border border-dashed text-body font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    isCreatingNew
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" /> Add another
                  class
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Course</Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => handleEventChange("title", e.target.value)}
                placeholder="e.g. CS-201 Data Structures"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-faculty">Faculty</Label>
              <Input
                id="event-faculty"
                value={newEvent.heldBy ?? ""}
                onChange={(e) => handleEventChange("heldBy", e.target.value)}
                placeholder="e.g. Dr. Sharma"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-desc">Room and notes</Label>
              <Textarea
                id="event-desc"
                value={newEvent.description ?? ""}
                onChange={(e) =>
                  handleEventChange("description", e.target.value)
                }
                placeholder="e.g. LH-3, lab group A"
                className="min-h-20 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              className="flex-1"
              disabled={!newEvent.title.trim()}
              onClick={() => {
                updateEvent(newEvent);
                setIsEditing(false);
              }}
            >
              {isCreatingNew ? "Add to timetable" : "Save class"}
            </Button>
            {!isCreatingNew && (
              <Button
                variant="destructive_soft"
                size="icon"
                aria-label="Delete class"
                onClick={() => {
                  deleteEvent();
                  setIsEditing(false);
                }}
              >
                <Trash2 />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const TimeTableMetaData = ({
  className,
}: React.ComponentProps<"div">) => {
  const { timetableData, setTimetableData } = useTimeTableStore();

  const handleChange = useCallback(
    <T extends keyof typeof timetableData>(
      field: T,
      value: (typeof timetableData)[T]
    ) => {
      setTimetableData({ ...timetableData, [field]: value });
    },
    [timetableData, setTimetableData]
  );

  return (
    <div className={cn("grid grid-cols-1 gap-5 md:grid-cols-3", className)}>
      <div className="grid gap-2">
        <Label htmlFor="tt-section">Section name</Label>
        <Input
          id="tt-section"
          placeholder="e.g. CSE-A"
          value={timetableData.sectionName}
          onChange={(e) => handleChange("sectionName", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tt-year">Year</Label>
          <Input
            id="tt-year"
            type="number"
            min={1}
            max={5}
            value={timetableData.year}
            onChange={(e) => handleChange("year", Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tt-semester">Semester</Label>
          <Input
            id="tt-semester"
            type="number"
            min={1}
            max={10}
            value={timetableData.semester}
            onChange={(e) => handleChange("semester", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tt-department">Department</Label>
        <Select
          value={timetableData.department_code}
          onValueChange={(val) => handleChange("department_code", val)}
        >
          <SelectTrigger id="tt-department">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS_LIST.map((dept) => (
              <SelectItem key={dept.code} value={dept.code}>
                <span className="mr-2 font-medium">{dept.short}</span>
                <span className="text-caption text-muted-foreground">
                  {dept.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
