import type { RawEvent } from "~/constants/common.time-table";
import { daysMap, timeMap } from "./constants";

/** Slot 0 starts at this hour; each slot lasts one hour (see `timeMap`). */
export const FIRST_HOUR = 8;
export const SLOT_COUNT = timeMap.size;
export const DAY_COUNT = daysMap.size;

export type ClassEvent = Pick<RawEvent, "title" | "description" | "heldBy">;

/** Consecutive slots holding the same events, merged into one block. `end` is exclusive. */
export type ClassBlock = { start: number; end: number; events: ClassEvent[] };

export type DayPlan = { index: number; label: string; blocks: ClassBlock[] };

export type CampusTime = { dayIndex: number; minutes: number };

type ScheduleLike = {
  schedule: { timeSlots: { events: RawEvent[] }[] }[];
};

export function buildWeek(timetable: ScheduleLike): DayPlan[] {
  return Array.from(daysMap.entries()).map(([dayIndex, label]) => {
    const blocks: ClassBlock[] = [];
    const slots = timetable.schedule[dayIndex]?.timeSlots ?? [];
    for (let slot = 0; slot < SLOT_COUNT; slot++) {
      const events: ClassEvent[] = (slots[slot]?.events ?? [])
        .filter((e) => e.title?.trim())
        .map(({ title, description, heldBy }) => ({
          title: title.trim(),
          description: description?.trim() || undefined,
          heldBy: heldBy?.trim() || undefined,
        }));
      if (events.length === 0) continue;
      const last = blocks.at(-1);
      if (
        last &&
        last.end === slot &&
        JSON.stringify(last.events) === JSON.stringify(events)
      ) {
        last.end = slot + 1;
      } else {
        blocks.push({ start: slot, end: slot + 1, events });
      }
    }
    return { index: dayIndex, label, blocks };
  });
}

export function formatHour(slot: number) {
  const hour = FIRST_HOUR + slot;
  const h12 = ((hour + 11) % 12) + 1;
  return `${h12}:00 ${hour < 12 ? "AM" : "PM"}`;
}

export const formatDuration = (slots: number) =>
  slots === 1 ? "1 hour" : `${slots} hours`;

/** The college runs on IST whatever the server or visitor timezone is. */
export function campusNow(date = new Date()): CampusTime {
  const ist = new Date(date.getTime() + 330 * 60_000);
  return {
    dayIndex: (ist.getUTCDay() + 6) % 7,
    minutes: ist.getUTCHours() * 60 + ist.getUTCMinutes(),
  };
}

export const slotAt = (minutes: number) =>
  Math.floor(minutes / 60) - FIRST_HOUR;
