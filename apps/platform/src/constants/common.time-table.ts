import { DEPARTMENTS_LIST } from "~/constants/core.departments";

import { nanoid } from "nanoid";
import * as z from "zod";

export const rawEvent = z.object({
  title: z.string(),
  description: z.string().optional(),
  heldBy: z.string().optional(),
  _id: z
    .string()
    .default(() => nanoid())
    .optional(),
});

export type RawEvent = z.infer<typeof rawEvent>;

export const rawTimeSlot = z.object({
  startTime: z.number().int().min(0).max(9),
  endTime: z.number().int().min(0).max(10),
  events: z.array(rawEvent),
});
export type RawTimeSlot = z.infer<typeof rawTimeSlot>;

export const rawTimetableSchema = z.object({
  department_code: z
    .string()
    .refine((val) => DEPARTMENTS_LIST.map((dept) => dept.code).includes(val), {
      message: "Invalid department code",
    }),
  sectionName: z.string(),
  year: z.number().int().min(1, "Year should be greater than 0"),
  semester: z.number().int().min(1, "Semester should be greater than 0"),
  schedule: z.array(
    z.object({
      day: z.number().int().min(0).max(6),
      timeSlots: z.array(
        z.object({
          startTime: z.number().int().min(0).max(9),
          endTime: z.number().int().min(0).max(10),
          events: z.array(
            z.object({
              _id: z.string().optional(),
              title: z.string(),
              description: z.string().optional(),
            })
          ),
        })
      ),
    })
  ),
  status: z.enum(["draft", "published","archived"]).default("draft"),
});
export type RawTimetableType = z.infer<typeof rawTimetableSchema>;
