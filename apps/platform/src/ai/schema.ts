import z from "zod";
import { courseSchemaByOCR } from "~/constants/common.course";
import { eventTypesEnums } from "~/constants/common.events";

export const eventsSchema = z.object({
  title: z.string().describe("Name of the event"),
  description: z
    .string()
    .optional()
    .describe("Description of the event (enter details instead of title)"),
  time: z
    .string()
    .datetime()
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime()); // Just ensure it's a valid date
      },
      {
        message: "Invalid datetime format",
      }
    )
    .describe(
      "Start time of the event, extract actual date from the document. Use 12:00 AM if all-day event"
    ),
  endDate: z
    .string()
    .datetime()
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime()); // Just ensure it's a valid date
      },
      {
        message: "Invalid datetime format",
      }
    )
    .describe(
      "End time of the event, extract actual date from the document. Use 12:00 AM if all-day event"
    )
    .optional()
    .describe(
      "Optional end date for the event, must be in the future if provided else null it is not required"
    ),
  eventType: eventTypesEnums.describe(
    "Type of event (e.g., 'meeting', 'holiday', etc.)"
  ),
  location: z
    .string()
    .optional()
    .describe(
      "Optional location for the event if applicable else empty string it is not required or Online if the event is online applicable like fees"
    ),
});
export const eventArraySchema = z
  .array(eventsSchema)
  .describe("Array of events, each event must follow the events schema");

  export const courseArraySchema = z
  .array(courseSchemaByOCR)
  .describe("Array of courses, each course must follow the course schema");