import { headers } from "next/headers";
import { cache } from "react";
import { ZodError } from "zod";
import { auth } from "~/auth";
import type { ActionResult } from "./_components/call-action";

export type { ActionResult };

// Mirrors app/[moderator]/(admin)/layout.tsx, which lets both roles in.
const ADMIN_ROLES = ["admin", "moderator"];

const getCurrentSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);

export class UnauthorizedError extends Error {
  constructor() {
    super("You need an admin session to do this.");
  }
}

/** A failure whose message is already written for the admin. */
export class ReportedError extends Error {
  constructor(
    message: string,
    readonly outage = false
  ) {
    super(message);
  }
}

export async function assertAdmin() {
  const session = await getCurrentSession();
  if (!session || !ADMIN_ROLES.includes(session.user.role)) {
    throw new UnauthorizedError();
  }
}

const UNREACHABLE = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "UND_ERR_CONNECT_TIMEOUT",
]);
const DROPPED = new Set(["ECONNRESET", "EPIPE", "UND_ERR_SOCKET"]);
const TIMED_OUT = new Set([
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "ETIMEDOUT",
  "TimeoutError",
]);
const DB_DOWN = new Set([
  "MongooseServerSelectionError",
  "MongoServerSelectionError",
  "MongoNetworkError",
  "MongoNetworkTimeoutError",
]);

// undici throws `TypeError: fetch failed` and keeps the socket error code on `cause`.
function causeKeys(err: unknown) {
  const keys: string[] = [];
  let current = err;
  for (let depth = 0; depth < 5; depth++) {
    if (!current || typeof current !== "object") break;
    const { name, code, cause } = current as {
      name?: unknown;
      code?: unknown;
      cause?: unknown;
    };
    if (typeof name === "string") keys.push(name);
    if (typeof code === "string") keys.push(code);
    current = cause;
  }
  return keys;
}

/** Turns anything thrown inside an action into a sentence that says which side failed. */
export function describeFailure(
  err: unknown,
  fallback: string
): { error: string; outage: boolean } {
  if (err instanceof ReportedError) {
    return { error: err.message, outage: err.outage };
  }
  if (err instanceof UnauthorizedError) {
    return { error: err.message, outage: false };
  }
  if (err instanceof ZodError) {
    return {
      error: `${fallback}: the request had invalid data.`,
      outage: false,
    };
  }

  const keys = causeKeys(err);
  const matches = (set: Set<string>) => keys.some((key) => set.has(key));
  if (matches(DB_DOWN)) {
    return {
      error:
        "The database isn't reachable right now. Nothing was changed; try again in a minute.",
      outage: true,
    };
  }
  if (matches(UNREACHABLE)) {
    return {
      error:
        "The results server is down or unreachable. Nothing was changed; try again once it's back up.",
      outage: true,
    };
  }
  if (matches(TIMED_OUT)) {
    return {
      error:
        "The results server took too long to reply. The job may still be running there, so check before retrying.",
      outage: true,
    };
  }
  if (matches(DROPPED)) {
    return {
      error:
        "The connection to the results server dropped mid-request. It may have finished anyway, so check before retrying.",
      outage: true,
    };
  }

  const message = err instanceof Error ? err.message : "";
  if (message.startsWith("Missing environment variable")) {
    return {
      error: `This app isn't configured to reach the results server (${message.split(": ")[1]} is not set).`,
      outage: true,
    };
  }
  if (message === "fetch failed") {
    return {
      error:
        "Couldn't reach the results server. It may be down; try again in a minute.",
      outage: true,
    };
  }
  return { error: message || fallback, outage: false };
}

/** Runs an action behind the admin check and turns throws into a result the client can show. */
export async function guarded<T>(
  fallback: string,
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    await assertAdmin();
    return { ok: true, data: await fn() };
  } catch (err) {
    if (!(err instanceof UnauthorizedError)) console.error(fallback, err);
    return { ok: false, ...describeFailure(err, fallback) };
  }
}

type HttpFailure = { status?: number; message?: unknown };

/** The error for a non-2xx reply from apps/server; the status tells the admin which side broke. */
export function upstreamFailure(detail: HttpFailure, fallback: string) {
  const { status } = detail;
  const said =
    typeof detail.message === "string" && detail.message
      ? detail.message
      : null;
  const code = status ? ` (HTTP ${status})` : "";

  if (status === 502 || status === 503 || status === 504) {
    return new ReportedError(
      `The results server is down or restarting${code}. Try again in a minute.`,
      true
    );
  }
  if (status === 401 || status === 403) {
    return new ReportedError(
      `The results server rejected this app's credentials${code}. Check SERVER_IDENTITY.`,
      true
    );
  }
  if (status && status >= 500) {
    return new ReportedError(
      `The results server hit an error: ${said ?? fallback}${code}.`
    );
  }
  return new ReportedError(`${said ?? fallback}${code}`);
}

type Envelope<T> = {
  error?: unknown;
  message?: string;
  data?: T;
} | null;

/** apps/server answers `{ error, message, data }`; better-fetch puts HTTP failures in `error`. */
export function unwrap<T>(res: unknown, fallback: string): T {
  const body = res as Envelope<T>;
  if (!body) {
    throw new ReportedError(`${fallback}: the results server sent no reply.`);
  }
  if (body.error) {
    throw upstreamFailure(
      typeof body.error === "object" ? body.error : { message: body.message },
      fallback
    );
  }
  return body.data as T;
}
