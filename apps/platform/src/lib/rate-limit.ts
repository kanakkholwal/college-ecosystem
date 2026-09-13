import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "~/db/connect";
import { rateLimits } from "~/db/schema";

type Limit = { key: string; max: number; windowSeconds: number };

/** Fixed-window counter in the shared `rateLimits` table; one atomic upsert per check. */
export async function consumeRateLimit({
  key,
  max,
  windowSeconds,
}: Limit): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const [row] = await db
    .insert(rateLimits)
    .values({ id: key, key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.lastRequest} < ${windowStart} then 1 else ${rateLimits.count} + 1 end`,
        lastRequest: sql`case when ${rateLimits.lastRequest} < ${windowStart} then ${now} else ${rateLimits.lastRequest} end`,
      },
    })
    .returning({
      count: rateLimits.count,
      lastRequest: rateLimits.lastRequest,
    });

  const allowed = row.count <= max;
  const retryAfterSeconds = allowed
    ? 0
    : Math.max(
        1,
        Math.ceil((row.lastRequest + windowSeconds * 1000 - now) / 1000)
      );
  return { allowed, retryAfterSeconds };
}

/** Best-effort client IP from the proxy headers this app is deployed behind. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}
