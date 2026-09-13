export const SLOT_DURATION = 30; // in minutes
export const SLOT_CAPACITY = 80; // number of students in a slot
export const SLOT_TIME_GAP = 5; // in minutes

export const ALLOTMENT_STATUSES = [
  "waiting",
  "open",
  "paused",
  "closed",
  "completed",
] as const;
export type AllotmentStatus = (typeof ALLOTMENT_STATUSES)[number];
