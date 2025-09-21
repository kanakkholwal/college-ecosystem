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
