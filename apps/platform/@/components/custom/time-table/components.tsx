"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { 
  CalendarClock, 
  Check, 
  ChevronDown, 
  Clock, 
  FileText, 
  Plus, 
  Trash2, 
  Type 
} from "lucide-react";

// Store & Types
import { useTimeTableStore } from "./store";
import type { EventTypeWithID } from "src/models/time-table";
import type { RawEvent } from "~/constants/common.time-table";
import { FormattedTimetable } from "./store";
import { daysMap, timeMap } from "./constants";
import { DEPARTMENTS_LIST } from "~/constants/core.departments";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* 1. EDIT EVENT SHEET                              */
/* -------------------------------------------------------------------------- */

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

  const [newEvent, setNewEvent] = useState<
    FormattedTimetable["schedule"][number]["timeSlots"][number]["events"][number]
  >({
    _id: nanoid(),
    title: "",
    description: "",
  });

  // Sync state when selection changes
  useEffect(() => {
    if (isEditing && editingEvent.eventIndex !== -1) {
      const event =
        timetableData.schedule[editingEvent.dayIndex]?.timeSlots[
          editingEvent.timeSlotIndex
        ]?.events[editingEvent.eventIndex];
      if (event) setNewEvent(event);
    } else {
      setNewEvent({ title: "", description: "", _id: nanoid() });
    }
  }, [isEditing, editingEvent, timetableData.schedule]);

  const handleEventChange = (field: keyof typeof newEvent, value: any) => {
    setNewEvent((prev) => ({ ...prev, [field]: value }));
  };

  const currentEvents = timetableData.schedule[editingEvent.dayIndex]?.timeSlots[editingEvent.timeSlotIndex]?.events || [];
  const isCreatingNew = editingEvent.eventIndex === currentEvents.length;

  return (
    <Sheet open={isEditing} onOpenChange={setIsEditing}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="pb-6 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <SheetTitle>Configure Slot</SheetTitle>
              <SheetDescription className="font-mono text-xs mt-1">
                {daysMap.get(editingEvent.dayIndex)?.toUpperCase()} • {timeMap.get(editingEvent.timeSlotIndex)}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          
          {/* --- Form Section --- */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">
                    {isCreatingNew ? "New Event Details" : "Edit Event Details"}
                </h4>
                
                {/* Mode Toggle (Create vs Edit) */}
                <div className="flex items-center gap-2">
                    <Label htmlFor="is-new" className="text-xs text-muted-foreground font-normal">Create New</Label>
                    <Switch
                        id="is-new"
                        checked={isCreatingNew}
                        onCheckedChange={(checked) => {
                            setEditingEvent({
                                ...editingEvent,
                                eventIndex: checked ? currentEvents.length : (currentEvents.length > 0 ? 0 : 0),
                            });
                        }}
                    />
                </div>
             </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
                <div className="relative">
                    <Type className="absolute left-3 top-2.5 size-4 text-muted-foreground/50" />
                    <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => handleEventChange("title", e.target.value)}
                        placeholder="e.g. Introduction to Algorithms"
                        className="pl-9"
                    />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</Label>
                <div className="relative">
                    <FileText className="absolute left-3 top-3 size-4 text-muted-foreground/50" />
                    <Textarea
                        id="desc"
                        value={newEvent.description}
                        onChange={(e) => handleEventChange("description", e.target.value)}
                        placeholder="Room 304, Prof. Sharma"
                        className="pl-9 min-h-[80px] resize-none"
                    />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => {
                  updateEvent(newEvent);
                  setNewEvent({ title: "", description: "", _id: nanoid() });
                  setIsEditing(false);
                }}
              >
                {isCreatingNew ? "Add to Schedule" : "Save Changes"}
              </Button>
              
              {!isCreatingNew && (
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                        deleteEvent();
                        setIsEditing(false);
                    }}
                >
                    <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* --- Existing Events Stack --- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">
                    Slot Contents
                </h4>
                <Badge variant="outline" className="font-mono text-[10px]">
                    {currentEvents.length} Item(s)
                </Badge>
            </div>

            {currentEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                    <Clock className="size-8 mb-2 opacity-50" />
                    <p className="text-xs">This time slot is empty.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {currentEvents.map((event, idx) => (
                        <button
                            key={event?._id || idx}
                            onClick={() => {
                                setEditingEvent({ ...editingEvent, eventIndex: idx });
                                setNewEvent(event);
                            }}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border text-left transition-all hover:bg-muted",
                                editingEvent.eventIndex === idx 
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                    : "border-border bg-card"
                            )}
                        >
                            <div className={cn(
                                "mt-0.5 size-2 rounded-full",
                                editingEvent.eventIndex === idx ? "bg-primary" : "bg-muted-foreground/30"
                            )} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{event.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{event.description || "No description"}</p>
                            </div>
                            {editingEvent.eventIndex === idx && <Check className="size-4 text-primary" />}
                        </button>
                    ))}
                    
                    {/* Add New Button in List */}
                    <button
                        onClick={() => {
                             setEditingEvent({ ...editingEvent, eventIndex: currentEvents.length });
                             setNewEvent({ title: "", description: "", _id: nanoid() });
                        }}
                        className={cn(
                            "flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed text-xs font-medium transition-colors",
                            isCreatingNew 
                                ? "border-primary text-primary bg-primary/5" 
                                : "border-border text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <Plus className="size-3.5" /> New Event
                    </button>
                </div>
            )}
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};


/* -------------------------------------------------------------------------- */
/* 2. METADATA FORM                                 */
/* -------------------------------------------------------------------------- */

export const TimeTableMetaData = ({ className }: React.ComponentProps<"div">) => {
  const { timetableData, setTimetableData } = useTimeTableStore();

  const handleChange = useCallback(
    <T extends keyof typeof timetableData>(field: T, value: (typeof timetableData)[T]) => {
      setTimetableData({ ...timetableData, [field]: value });
    },
    [timetableData, setTimetableData]
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Section Name */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section Name</Label>
          <Input
            placeholder="e.g. CSE-A"
            value={timetableData.sectionName}
            onChange={(e) => handleChange("sectionName", e.target.value)}
            className="font-medium"
          />
        </div>

        {/* Year & Sem Group */}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</Label>
                <Input
                    type="number"
                    min={1} max={5}
                    value={timetableData.year}
                    onChange={(e) => handleChange("year", Number(e.target.value))}
                />
             </div>
             <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sem</Label>
                <Input
                    type="number"
                    min={1} max={10}
                    value={timetableData.semester}
                    onChange={(e) => handleChange("semester", Number(e.target.value))}
                />
             </div>
        </div>

        {/* Department Select */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</Label>
          <Select
            value={timetableData.department_code}
            onValueChange={(val) => handleChange("department_code", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Dept" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS_LIST.map((dept) => (
                <SelectItem key={dept.code} value={dept.code}>
                  <span className="font-medium mr-2">{dept.code}</span>
                  <span className="text-muted-foreground text-xs">{dept.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};


/* -------------------------------------------------------------------------- */
/* 3. EVENT CHIP (GRID ITEM)                        */
/* -------------------------------------------------------------------------- */

export function Event({ event }: { event: EventTypeWithID | RawEvent }) {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <div className="group flex h-full w-full cursor-pointer flex-col justify-between rounded-md border border-border bg-card p-1.5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5">
            {/* Colored Bar Indicator */}
            <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary/40 group-hover:bg-primary transition-colors" />
            
            <div className="pl-2">
                <p className="text-xs font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                </p>
                {event.description && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                        {event.description}
                    </p>
                )}
            </div>
        </div>
      </HoverCardTrigger>
      
      {/* Popover Details */}
      <HoverCardContent side="right" align="start" className="w-64 p-3">
        <div className="flex items-start gap-3">
           <div className="mt-0.5 p-1.5 rounded-md bg-muted text-foreground">
              <FileText className="size-3.5" />
           </div>
           <div className="space-y-1">
              <h4 className="text-sm font-semibold">{event.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {event.description || "No additional details."}
              </p>
              {/* Add HeldBy logic here if you have it in your schema */}
           </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}