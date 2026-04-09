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

export const requestOutPassSchema = z
  .object({
    roomNumber: z
      .string()
      .nonempty()
      .min(3)
      .refine(
        (value) => {
          if (value === "UNKNOWN" || value.trim() === "") {
            return false;
          }
          return true;
        },
        {
          message: "Invalid room number provided or room number is UNKNOWN",
        }
      ),
    address: z.string().min(4).nonempty(),
    reason: z.enum(REASONS, {
      message: "Invalid reason",
    }),
    expectedOutTime: z
      .string()
      .datetime()
      .refine(
        (value) => {
          const outTime = new Date(value);
          if (outTime < new Date()) {
            return false;
          }
          return true;
        },
        {
          message: "Expected out time can't be in past",
        }
      ),
    expectedInTime: z.string().datetime(),
  })
  .refine(
    (data) => {
      const outTime = new Date(data.expectedOutTime).getTime();
      const inTime = new Date(data.expectedInTime).getTime();
      if (inTime < outTime) {
        return false;
      }
      return true;
    },
    {
      message: "Expected out time can't be more than expected in time",
      path: ["expectedOutTime"],
    }
  )
  .refine(
    (data) => {
      const outTime = new Date(data.expectedOutTime);
      const inTime = new Date(data.expectedInTime);
      const sixPM = new Date(outTime);
      sixPM.setHours(18, 0, 0, 0);
      const eightPM = new Date(inTime);
      eightPM.setHours(20, 0, 0, 0);

      if (
        (data.reason === "market" || data.reason === "outing") &&
        (outTime > sixPM || inTime > eightPM)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "For market or outing, expectedOutTime can't be more than 6 PM and expectedInTime can't be more than 8 PM",
      path: ["expectedInTime"],
    }
  )
  .refine(
    (data) => {
      const outTime = new Date(data.expectedOutTime);
      const inTime = new Date(data.expectedInTime);
      // if reason market or outing inTime should be same day / today
      if (
        (data.reason === "market" || data.reason === "outing") &&
        outTime.getDate() !== inTime.getDate()
      ) {
        return false;
      }
      return true;
    },
    {
      message: "For market or outing, expected in time should be same day",
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
