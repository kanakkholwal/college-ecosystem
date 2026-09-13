import { z } from "zod";

export const REASONS = [
  "outing",
  "medical",
  "home",
  "market",
  "other",
] as const;
export const OUTPASS_STATUS = [
  "pending",
  "approved",
  "rejected",
  "in_use",
  "processed",
] as const;

const campusClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Campus (IST) calendar day and minutes past midnight, whatever the runtime's timezone. */
export function campusTime(value: Date | string) {
  const parts = Object.fromEntries(
    campusClock.formatToParts(new Date(value)).map((p) => [p.type, p.value])
  );
  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export const LOCAL_TRIP_REASONS = ["market", "outing"] as const;
/** Latest IST leave and return times for market and outing passes, in minutes past midnight. */
export const LOCAL_TRIP_LIMITS = { leaveBy: 18 * 60, returnBy: 20 * 60 };

const isLocalTrip = (reason: string) =>
  (LOCAL_TRIP_REASONS as readonly string[]).includes(reason);

export const requestOutPassSchema = z
  .object({
    roomNumber: z
      .string()
      .trim()
      .min(1, { message: "Add your room number." })
      .refine((value) => value !== "UNKNOWN", {
        message: "Add your room number.",
      }),
    address: z
      .string()
      .trim()
      .min(4, { message: "Say where you're going, at least 4 characters." })
      .max(200, { message: "Keep the destination under 200 characters." }),
    reason: z.enum(REASONS, {
      message: "Pick a reason.",
    }),
    expectedOutTime: z
      .string()
      .datetime({ message: "Pick when you're leaving." })
      .refine((value) => new Date(value) >= new Date(Date.now() - 60_000), {
        message: "Leaving time can't be in the past.",
      }),
    expectedInTime: z.string().datetime({ message: "Pick when you're back." }),
  })
  .refine(
    (data) =>
      new Date(data.expectedInTime).getTime() >
      new Date(data.expectedOutTime).getTime(),
    {
      message: "Return time must be after leaving time.",
      path: ["expectedInTime"],
    }
  )
  .refine(
    (data) =>
      !isLocalTrip(data.reason) ||
      campusTime(data.expectedOutTime).minutes <= LOCAL_TRIP_LIMITS.leaveBy,
    {
      message: "For market or outing, leave by 6:00 PM IST.",
      path: ["expectedOutTime"],
    }
  )
  .refine(
    (data) =>
      !isLocalTrip(data.reason) ||
      campusTime(data.expectedInTime).minutes <= LOCAL_TRIP_LIMITS.returnBy,
    {
      message: "For market or outing, be back by 8:00 PM IST.",
      path: ["expectedInTime"],
    }
  )
  .refine(
    (data) =>
      !isLocalTrip(data.reason) ||
      campusTime(data.expectedOutTime).day ===
        campusTime(data.expectedInTime).day,
    {
      message: "For market or outing, come back the same day.",
      path: ["expectedInTime"],
    }
  );

export const CONSTANTS = {
  outPassStatus: {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
  },
  outPassStatusColor: {
    pending: "yellow",
    approved: "green",
    rejected: "red",
  },
  outPassStatusText: {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  },
  outPassStatusIcon: {
    pending: "clock",
    approved: "check",
    rejected: "x",
  },
  outPassTimings: {
    outTime: "17:00",
    inTime: "20:00",
  },
} as const;
