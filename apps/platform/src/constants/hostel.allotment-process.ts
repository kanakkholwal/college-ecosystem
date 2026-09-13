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

export const ALLOTMENT_STATUS_COPY: Record<
  AllotmentStatus,
  { label: string; effect: string }
> = {
  waiting: {
    label: "Not started",
    effect: "Residents see that selection hasn't opened.",
  },
  open: {
    label: "Open",
    effect: "Residents whose slot has started can pick rooms.",
  },
  paused: {
    label: "Paused",
    effect: "Nobody can pick or change rooms until you reopen.",
  },
  closed: {
    label: "Closed",
    effect: "Selection has ended. Rooms stay as they are.",
  },
  completed: {
    label: "Completed",
    effect: "Marks this round as finished for residents.",
  },
};
