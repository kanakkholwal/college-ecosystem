import { ZodError } from "zod";
import { isDuplicateKeyError } from "~/lib/mongo-errors";

export type ActionResult<T> =
  | { ok: true; data: T }
  // `outage` means a server or the network is down, so retrying right away will fail too.
  | { ok: false; error: string; outage?: boolean };

/** A failure whose message is written for the user and survives Next's prod error masking. */
export class UserFacingError extends Error {
  constructor(
    message: string,
    readonly outage = false
  ) {
    super(message);
    this.name = "UserFacingError";
  }
}

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });

export type ActionFailure = Extract<ActionResult<never>, { ok: false }>;

export const fail = (error: string, outage?: boolean): ActionFailure =>
  outage ? { ok: false, error, outage } : { ok: false, error };

export type RunActionOptions = {
  /** Shown when Mongo rejects a write with E11000. */
  duplicate?: string;
};

/** Runs `fn` and turns anything it throws into a result the client can show. */
export async function runAction<T>(
  fallback: string,
  fn: () => Promise<T>,
  options: RunActionOptions = {}
): Promise<ActionResult<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    if (err instanceof UserFacingError) return fail(err.message, err.outage);
    if (err instanceof ZodError) {
      return fail(`${fallback}: the request had invalid data.`);
    }
    if (options.duplicate && isDuplicateKeyError(err)) {
      return fail(options.duplicate);
    }
    console.error(fallback, err);
    return fail(fallback);
  }
}
