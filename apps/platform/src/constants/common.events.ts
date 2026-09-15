import { z } from "zod";

export const eventTypes = [
  "registration",
  "exam",
  "holiday",
  "conference",
  "college_fest",
  "sports",
  "cultural",
  "webinar",
  "workshop",
  "social",
  "other",
  "meeting",
] as const;

export const eventTypesEnums = z.enum(eventTypes);

/** Shared by edits and imports, so past events stay valid; new events use `newEventSchema`. */
export const rawEventsSchema = z
  .object({
    title: z
      .string()
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters long")
      .max(
        100,
        "Name must be at most 100 characters long (enter description instead)"
      ), // Name of the event
    description: z.string(),
    links: z.array(z.string().url()).default([]).optional(), // Array of links related to the event
    time: z.date(),
    // .refine((date) => ((new Date(date) > new Date()) && (new Date(date).getMonth() < new Date().getMonth())), {
    //   message: "Event time must be in the future",
    // })
    endDate: z.date().optional(), // Optional end date for the event
    eventType: eventTypesEnums, // Type of event (e.g., "meeting", "holiday", etc.)
    location: z.string().optional(), // Optional location for the event
  })
  .refine(
    (data) => {
      // Ensure that endDate is after time if both are provided
      if (data.endDate && data.time) {
        return new Date(data.endDate) > new Date(data.time);
      }
      return true;
    },
    {
      message: "End date must be after the event time",
      path: ["endDate"],
    }
  );

export const newEventSchema = rawEventsSchema.refine(
  (data) => !data.endDate || new Date(data.endDate) > new Date(),
  { message: "End date must be in the future", path: ["endDate"] }
);

export type rawEventsSchemaType = z.infer<typeof rawEventsSchema>;
