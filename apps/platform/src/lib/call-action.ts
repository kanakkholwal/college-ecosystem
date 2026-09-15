import type { ActionResult } from "~/lib/action-result";

export type { ActionResult };

/** Calls a server action from the browser; a rejected call (offline, app down, deploy skew) becomes an error result. */
export async function callAction<T>(
  action: () => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  try {
    return await action();
  } catch (err) {
    console.error("Server action failed", err);
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return {
        ok: false,
        outage: true,
        error: "You're offline. Reconnect and try again.",
      };
    }
    return {
      ok: false,
      outage: true,
      error:
        "The request didn't complete: this app's server didn't answer. Reload the page to see whether it went through before retrying.",
    };
  }
}
