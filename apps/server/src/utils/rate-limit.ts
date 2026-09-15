import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { EVENTS } from "../constants/result_scraping";

const MINUTE = 60_000;

/** Every limit in one place. Counts are per client key per window. */
export const RATE_LIMITS = {
  // Only the platform's server calls /api, so all non-admin traffic shares its IP key.
  general: { windowMs: MINUTE, limit: 1000 },
  // A full flagged-records refresh is ~190 sequential 16-roll chunks; an SSE stream counts once.
  scrape: { windowMs: 15 * MINUTE, limit: 300 },
  // Scrapes every department page on the college site.
  facultyRefresh: { windowMs: 60 * MINUTE, limit: 5 },
} as const;

const MAX_CLIENT_ID_LENGTH = 128;

/** X-Client-Id (set by the platform's authenticated proxy) when present, else the IP. */
export function clientKey(req: Request): string | null {
  const clientId = req.header("X-Client-Id")?.trim();
  if (clientId) return `client:${clientId.slice(0, MAX_CLIENT_ID_LENGTH)}`;
  const ip = req.ip ?? req.socket.remoteAddress;
  return ip ? `ip:${ipKeyGenerator(ip)}` : null;
}

function limiter(
  { windowMs, limit }: { windowMs: number; limit: number },
  skip?: (req: Request) => boolean
) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req) => clientKey(req) ?? "unknown",
    skip,
    message: {
      error: true,
      message: "Too many requests, please try again later.",
      data: null,
    },
  });
}

const STREAM_ACTIONS: readonly string[] = [
  EVENTS.STREAM_SCRAPING,
  EVENTS.TASK_PAUSED_RESUME,
  EVENTS.TASK_RETRY_FAILED,
];

export const generalLimiter = limiter(RATE_LIMITS.general);

// Task list/delete share the scrape-sse path but are cheap, so only stream openings count here.
export const scrapeLimiter = limiter(
  RATE_LIMITS.scrape,
  (req) =>
    req.path === "/results/scrape-sse" &&
    !STREAM_ACTIONS.includes(String(req.query.action))
);

export const facultyRefreshLimiter = limiter(RATE_LIMITS.facultyRefresh);
