import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "~/auth";

// Mirrors app/[moderator]/(admin)/layout.tsx, which lets both roles in.
const ADMIN_ROLES = ["admin", "moderator"];

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const getCurrentSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);

export class UnauthorizedError extends Error {
  constructor() {
    super("You need an admin session to do this.");
  }
}

export async function assertAdmin() {
  const session = await getCurrentSession();
  if (!session || !ADMIN_ROLES.includes(session.user.role)) {
    throw new UnauthorizedError();
  }
}

/** Runs a write behind the admin check and turns throws into a result the client can show. */
export async function guarded<T>(
  fallback: string,
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    await assertAdmin();
    return { ok: true, data: await fn() };
  } catch (err) {
    if (!(err instanceof UnauthorizedError)) console.error(fallback, err);
    return {
      ok: false,
      error: err instanceof Error && err.message ? err.message : fallback,
    };
  }
}

type Envelope<T> = {
  error?: unknown;
  message?: string;
  data?: T;
} | null;

/** apps/server answers `{ error, message, data }`; better-fetch puts HTTP failures in `error`. */
export function unwrap<T>(res: unknown, fallback: string): T {
  const body = res as Envelope<T>;
  if (!body || body.error) {
    const detail = body?.error;
    const message =
      typeof detail === "object" &&
      detail !== null &&
      "message" in detail &&
      typeof detail.message === "string"
        ? detail.message
        : body?.message;
    throw new Error(message || fallback);
  }
  return body.data as T;
}
