import {
  fromIstParts,
  toIstParts,
} from "@/components/application/event/format";
import { z } from "zod";
import {
  eventTypes,
  eventTypesEnums,
  type rawEventsSchemaType,
} from "~/constants/common.events";

export const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};

// Every base field accepts any string so superRefine reports all problems in one pass.
const buildEventFormSchema = (requireFutureEnd: boolean) =>
  z
    .object({
      title: z.string(),
      eventType: eventTypesEnums,
      description: z.string(),
      startDate: z.string(),
      allDay: z.boolean(),
      startTime: z.string(),
      hasEnd: z.boolean(),
      endDate: z.string(),
      endTime: z.string(),
      location: z.string(),
      links: z.array(z.object({ url: z.string() })),
    })
    .superRefine((values, ctx) => {
      const issue = (path: string, message: string) =>
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: path.split("."),
          message,
        });

      const title = values.title.trim();
      if (!title) issue("title", "Give the event a title");
      else if (title.length < 3) issue("title", "Use at least 3 characters");
      else if (title.length > 100)
        issue(
          "title",
          "Keep it under 100 characters and put the rest in the description"
        );

      values.links.forEach((link, index) => {
        if (!isHttpUrl(link.url.trim()))
          issue(
            `links.${index}.url`,
            "Enter a full link starting with https://"
          );
      });

      if (!values.startDate) issue("startDate", "Pick a start date");
      if (!values.allDay && !values.startTime)
        issue("startTime", "Pick a start time, or turn on All day");
      if (!values.hasEnd) return;

      if (!values.endDate) return issue("endDate", "Pick an end date");
      if (!values.allDay && !values.endTime)
        return issue("endTime", "Pick an end time");
      if (!values.startDate || (!values.allDay && !values.startTime)) return;

      const { time, endDate } = toEventPayload(values);
      const endField = values.allDay ? "endDate" : "endTime";
      if (!endDate || endDate <= time)
        issue(endField, "The end must be after the start");
      // newEventSchema rejects past end dates, so surface that here instead of on save.
      else if (requireFutureEnd && endDate <= new Date())
        issue(endField, "The end must be in the future");
    });

export const eventFormSchema = buildEventFormSchema(true);
/** Edits skip the future-end rule so events that already ended stay editable. */
export const editEventFormSchema = buildEventFormSchema(false);

export type EventFormValues = z.infer<typeof eventFormSchema>;

export function toEventPayload(values: EventFormValues): rawEventsSchemaType {
  const time = fromIstParts(
    values.startDate,
    values.allDay ? "00:00" : values.startTime
  );
  const endDate =
    values.hasEnd && values.endDate
      ? fromIstParts(values.endDate, values.allDay ? "23:59" : values.endTime)
      : undefined;
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    eventType: values.eventType,
    location: values.location.trim(),
    links: values.links.map((link) => link.url.trim()),
    time,
    endDate,
  };
}

export const EMPTY_EVENT_FORM: EventFormValues = {
  title: "",
  eventType: eventTypes[0],
  description: "",
  startDate: "",
  allDay: false,
  startTime: "",
  hasEnd: false,
  endDate: "",
  endTime: "",
  location: "",
  links: [],
};

/** Form values for an existing event, read in IST. Midnight starts are all-day, as on the calendar. */
export function eventToFormValues(event: {
  title: string;
  eventType: string;
  description?: string;
  time: Date | string;
  endDate?: Date | string | null;
  location?: string;
  links?: string[];
}): EventFormValues {
  const start = toIstParts(event.time);
  const end = event.endDate ? toIstParts(event.endDate) : null;
  const allDay = start.time === "00:00";
  const type = eventTypesEnums.safeParse(event.eventType);
  return {
    title: event.title,
    eventType: type.success ? type.data : "other",
    description: event.description ?? "",
    startDate: start.date,
    allDay,
    startTime: allDay ? "" : start.time,
    hasEnd: !!end,
    endDate: end?.date ?? "",
    endTime: end && !allDay ? end.time : "",
    location: event.location ?? "",
    links: (event.links ?? []).map((url) => ({ url })),
  };
}

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Reads the `yyyy-mm-dd` prefix of a query value such as the calendar's `?time=2026-09-20T00:00:00`. */
export function dayFromParam(value?: string) {
  const day = value?.slice(0, 10);
  return day && DAY_KEY.test(day) ? day : "";
}
