
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.warn("[redis] REDIS_URL not set – caching disabled");
}

// ---- Redis instance (lazy-safe) ----
const redis = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1, // fail fast
      enableOfflineQueue: false, // don't pile up commands
      reconnectOnError(err) {
        // reconnect on READONLY / connection resets / max clients
        const msg = err.message || "";
        return (
          msg.includes("READONLY") ||
          msg.includes("ECONNRESET") ||
          msg.includes("ETIMEDOUT") ||
          msg.includes("max number of clients") ||
          msg.includes("LOADING")
        );
      },
      retryStrategy(times) {
        // exponential backoff, cap at 5s
        return Math.min(times * 200, 5000);
      },
    })

// ---- Connection guards ----
async function ensureRedisReady(): Promise<boolean> {
  if (!redis) return false;

  try {
    if (redis.status === "ready") return true;
    if (redis.status === "connecting") return false;

    await redis.connect();
    return true;
  } catch (err) {
    console.error("[redis] connect failed:", (err as Error).message);
    return false;
  }
}

// ---- Flush ALL keys (safe wrapper) ----
export async function flushAllRedisKeys(): Promise<boolean> {
    "use server";
  if (!(await ensureRedisReady())) {
    console.warn("[redis] flush skipped – redis not ready");
    return false;
  }

  try {
    await redis!.flushall();
    console.log("[redis] FLUSHALL successful");
    return true;
  } catch (err) {
    const msg = (err as Error).message;
    console.error("[redis] FLUSHALL failed:", msg);

    // plan limits / managed redis restrictions
    if (
      msg.includes("NOPERM") ||
      msg.includes("permission") ||
      msg.includes("unknown command")
    ) {
      console.warn("[redis] FLUSHALL not permitted on this plan");
    }

    return false;
  }
}

// ---- Safe wrappers (use these instead of redis.get/set directly) ----
export async function redisGet<T = any>(key: string): Promise<T | null> {
  if (!(await ensureRedisReady())) return null;

  try {
    const val = await redis!.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch (err) {
    console.error("[redis] GET error:", (err as Error).message);
    return null;
  }
}

export async function redisSet(
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<boolean> {
  if (!(await ensureRedisReady())) return false;

  try {
    const payload = JSON.stringify(value);
    if (ttlSeconds) {
      await redis!.set(key, payload, "EX", ttlSeconds);
    } else {
      await redis!.set(key, payload);
    }
    return true;
  } catch (err) {
    console.error("[redis] SET error:", (err as Error).message);
    return false;
  }
}

export async function redisDel(key: string): Promise<boolean> {
  if (!(await ensureRedisReady())) return false;

  try {
    await redis!.del(key);
    return true;
  } catch (err) {
    console.error("[redis] DEL error:", (err as Error).message);
    return false;
  }
}

// ---- Optional lifecycle logs (useful in prod) ----
if (redis) {
  redis.on("connect", () => {
    console.log("[redis] connected");
  });

  redis.on("ready", () => {
    console.log("[redis] ready");
  });

  redis.on("error", (err) => {
    console.error("[redis] error:", err.message);
  });

  redis.on("close", () => {
    console.warn("[redis] connection closed");
  });
}

export default redis;
