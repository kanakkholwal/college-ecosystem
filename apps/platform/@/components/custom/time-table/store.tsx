// src/app/[locale]/(main)/timetable/editor/store.ts
import { create } from "zustand";
import type { RawEvent, RawTimetableType } from "~/constants/common.time-table";
import type { TimeTableWithID } from "~/models/time-table";
import { rawTimetableData } from "./constants";

export type FormattedTimetable = TimeTableWithID | RawTimetableType;

export interface TimeTableStore {
  timetableData: FormattedTimetable;
  editingEvent: {
    dayIndex: number;
    timeSlotIndex: number;
    eventIndex: number;
  };
  isEditing: boolean;
  disabled: boolean;
  initialize: (
    timetableDataProp?: TimeTableWithID | RawTimetableType,
    mode?: "create" | "edit"
  ) => void;
  setTimetableData: (data: FormattedTimetable) => void;
  setEditingEvent: (event: {
    dayIndex: number;
    timeSlotIndex: number;
    eventIndex: number;
  }) => void;
  setIsEditing: (editing: boolean) => void;
  setDisabled: (disabled: boolean) => void;
  updateEvent: (newEvent: RawEvent) => void;
  deleteEvent: () => void;
}

export const useTimeTableStore = create<TimeTableStore>((set) => ({
  timetableData: rawTimetableData,
  editingEvent: {
    dayIndex: 0,
    timeSlotIndex: 0,
    eventIndex: -1,
  },
  isEditing: false,
  disabled: false,
  initialize: (timetableDataProp, mode) => {
    set({
      timetableData:
        mode === "edit" && timetableDataProp
          ? timetableDataProp
          : rawTimetableData,
      editingEvent: { dayIndex: 0, timeSlotIndex: 0, eventIndex: -1 },
      isEditing: false,
      disabled: false,
    });
  },
  setTimetableData: (timetableData) => set({ timetableData }),
  setEditingEvent: (editingEvent) => set({ editingEvent }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setDisabled: (disabled) => set({ disabled }),
  updateEvent: (newEvent) => {
    set((state) => {
      const { dayIndex, timeSlotIndex, eventIndex } = state.editingEvent;
      const updatedSchedule = [...state.timetableData.schedule];

      if (updatedSchedule[dayIndex]) {
        const updatedTimeSlots = [...updatedSchedule[dayIndex].timeSlots];

        if (updatedTimeSlots[timeSlotIndex]) {
          const updatedEvents = [...updatedTimeSlots[timeSlotIndex].events];

          if (eventIndex !== -1) {
            updatedEvents[eventIndex] = newEvent;
          } else {
            updatedEvents.push(newEvent);
          }

          updatedTimeSlots[timeSlotIndex] = {
            ...updatedTimeSlots[timeSlotIndex],
            events: updatedEvents,
          };
        }

        updatedSchedule[dayIndex] = {
          ...updatedSchedule[dayIndex],
          timeSlots: updatedTimeSlots,
        };
      }

      return {
        timetableData: {
          ...state.timetableData,
          schedule: updatedSchedule,
        },
      };
    });
  },
  deleteEvent: () => {
    set((state) => {
      const { dayIndex, timeSlotIndex, eventIndex } = state.editingEvent;
      const updatedSchedule = [...state.timetableData.schedule];

      if (updatedSchedule[dayIndex]) {
        const updatedTimeSlots = [...updatedSchedule[dayIndex].timeSlots];

        if (updatedTimeSlots[timeSlotIndex]) {
          const updatedEvents = updatedTimeSlots[timeSlotIndex].events.filter(
            (_, index) => index !== eventIndex
          );

          updatedTimeSlots[timeSlotIndex] = {
            ...updatedTimeSlots[timeSlotIndex],
            events: updatedEvents,
          };
        }

        updatedSchedule[dayIndex] = {
          ...updatedSchedule[dayIndex],
          timeSlots: updatedTimeSlots,
        };
      }

      return {
        timetableData: {
          ...state.timetableData,
          schedule: updatedSchedule,
        },
      };
    });
  },
}));
