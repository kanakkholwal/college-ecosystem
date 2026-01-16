// // lib/rateLimiter.ts
// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";

// const redis = Redis.fromEnv();

// // 10 requests per 60s per identifier
// export const rateLimiter = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(10, "60 s"),
//   analytics: true,
// });

// For in-memory rate limiting (not suitable for production) but useful for simple cases like accidental or repeated click abuse
const requests = new Map<string, { count: number; last: number }>();

export function rateLimit(ip: string, limit = 10, interval = 60_000) {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now - entry.last > interval) {
    requests.set(ip, { count: 1, last: now });
    return true;
  }

  if (entry.count < limit) {
    entry.count++;
    return true;
  }

  return false; // rate limit exceeded
}
