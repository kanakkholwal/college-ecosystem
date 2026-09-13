import { cache } from "react";
import { getSession } from "~/auth/server";

/** One session lookup per request, shared by every dashboard section. */
export const getViewer = cache(async () => {
  const session = await getSession();
  return session?.user ?? null;
});

/** Greeting for the campus clock (IST), whatever the server timezone is. */
export function greeting(name?: string | null, date = new Date()) {
  const istHour = new Date(date.getTime() + 330 * 60_000).getUTCHours();
  const part =
    istHour < 5
      ? "Good evening"
      : istHour < 12
        ? "Good morning"
        : istHour < 17
          ? "Good afternoon"
          : "Good evening";
  const first = name?.trim().split(/\s+/)[0];
  return first ? `${part}, ${first}` : part;
}
