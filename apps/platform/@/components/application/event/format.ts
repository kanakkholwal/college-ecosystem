// Events are entered and grouped in IST; formatting in a fixed zone keeps server and client output identical.
export const EVENT_TIME_ZONE = "Asia/Kolkata";

export type EventLike = {
  title: string;
  description?: string;
  time: Date | string;
  endDate?: Date | string | null;
  location?: string;
  eventType?: string;
  links?: string[];
};

const keyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const clockFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: EVENT_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const shortDateFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: EVENT_TIME_ZONE,
  day: "numeric",
  month: "short",
});

/** `yyyy-mm-dd` of a moment in IST. */
export const dayKey = (date: Date | string) => keyFormat.format(new Date(date));

const hourFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: EVENT_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// ICU separates the meridiem with a narrow no-break space; normalise it.
const clock = (date: Date) =>
  clockFormat.format(date).replace(/\s/g, " ").toUpperCase();

const isMidnight = (date: Date) => hourFormat.format(date) === "00:00";

export function formatEventTime(event: EventLike): string {
  const start = new Date(event.time);
  const end = event.endDate ? new Date(event.endDate) : null;
  const allDay = isMidnight(start);

  if (!end) return allDay ? "All day" : clock(start);
  if (dayKey(start) !== dayKey(end)) {
    const from = allDay ? "" : `${clock(start)}, `;
    return `${from}until ${shortDateFormat.format(end)}`;
  }
  return allDay ? "All day" : `${clock(start)} to ${clock(end)}`;
}

export function isHappeningNow(event: EventLike, now = new Date()): boolean {
  if (!event.endDate) return false;
  return new Date(event.time) <= now && new Date(event.endDate) > now;
}

export const eventTypeLabel = (type?: string) =>
  type ? (type.charAt(0).toUpperCase() + type.slice(1)).replace("_", " ") : "";

/** Parses a `yyyy-mm-dd` key into UTC parts so month maths never depends on the viewer's zone. */
export function parseDayKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

export const toDayKey = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
