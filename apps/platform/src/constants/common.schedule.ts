import { z } from "zod";

export const modeEnums = ["day", "week", "month"] as const;

export const scheduleAccessTypeEnums = [
  "all",
  "department",
  "batch",
  "programme",
  "role",
] as const;

export const scheduleAccessSchema = z.object({
  type: z.enum(scheduleAccessTypeEnums),
  value: z.string(),
});

export const scheduleEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  color: z.string(),
  start: z.date(),
  end: z.date(),
  description: z.string(),
});

export const scheduleSchema = z.object({
  title: z.string(),
  description: z.string(),
  startTime: z.date().refine((date) => date !== null, {
    message: "A date and time is required.",
  }),
  endTime: z.date().refine((date) => date !== null, {
    message: "A date and time is required.",
  }),
  mode: z.enum(modeEnums),
  events: z.array(scheduleEventSchema),
  access: z.array(scheduleAccessSchema),
});
