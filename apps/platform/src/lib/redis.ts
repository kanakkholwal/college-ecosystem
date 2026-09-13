import Redis, { type RedisOptions } from "ioredis";

// Redis is a cache only: every helper resolves to a fallback instead of throwing or waiting.
const REDIS_URL = process.env.REDIS_URL!;

const COMMAND_TIMEOUT_MS = 400;
const CONNECT_TIMEOUT_MS = 1500;
const FAILURES_BEFORE_OPEN = 3;
const BASE_COOLDOWN_MS = 30_000;
const MAX_COOLDOWN_MS = 5 * 60_000;
// A spent free-tier quota won't recover in minutes, so back off for an hour.
const QUOTA_COOLDOWN_MS = 60 * 60_000;
const QUOTA_ERROR =
  /max (daily|monthly)? ?requests? limit|limit exceeded|quota|exceeded .*limit|OOM command not allowed/i;

type BreakerState = {
  failures: number;
  openUntil: number;
  cooldown: number;
  loggedOpen: boolean;
};

type RedisGlobal = typeof globalThis & {
  __redisClient?: Redis | null;
  __redisBreaker?: BreakerState;
};

const g = globalThis as RedisGlobal;

// Dev HMR re-evaluates this module; reuse one client instead of leaking a connection per reload.
if (!g.__redisBreaker) {
  g.__redisBreaker = {
    failures: 0,
    openUntil: 0,
    cooldown: BASE_COOLDOWN_MS,
    loggedOpen: false,
  };
}
const breaker: BreakerState = g.__redisBreaker;

function createClient(): Redis | null {
  if (!REDIS_URL) {
    console.warn("[redis] REDIS_URL not set, caching disabled");
    return null;
  }
  const options: Omit<RedisOptions, "T"> = {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
    connectTimeout: CONNECT_TIMEOUT_MS,
    commandTimeout: COMMAND_TIMEOUT_MS,
    // Reconnect in the background with backoff; while the breaker is open, stop and let the next request retry.
    retryStrategy(times) {
      if (Date.now() < breaker.openUntil) return null;
      return Math.min(times * 500, 10_000);
    },
    reconnectOnError(err) {
      return /READONLY|ECONNRESET|ETIMEDOUT|LOADING/.test(err.message);
    },
  };
  // ioredis 5.11.1 ships a stray required "T" in RedisOptions (a doc-comment typo); drop the cast once it's fixed upstream.
  const client = new Redis(REDIS_URL, options as RedisOptions);
  // Without an error listener ioredis rethrows connection errors as unhandled and crashes the process.
  client.on("error", (err) => recordFailure(err));
  client.on("ready", () => recordSuccess());
  return client;
}

const client: Redis | null =
  g.__redisClient !== undefined ? g.__redisClient : createClient();
g.__redisClient = client;

function recordSuccess() {
  if (breaker.failures > 0 || breaker.openUntil > 0) {
    if (breaker.loggedOpen) console.info("[redis] recovered, cache enabled");
  }
  breaker.failures = 0;
  breaker.openUntil = 0;
  breaker.cooldown = BASE_COOLDOWN_MS;
  breaker.loggedOpen = false;
}

function recordFailure(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const quota = QUOTA_ERROR.test(message);
  breaker.failures += 1;
  if (!quota && breaker.failures < FAILURES_BEFORE_OPEN) return;

  const cooldown = quota ? QUOTA_COOLDOWN_MS : breaker.cooldown;
  breaker.openUntil = Date.now() + cooldown;
  if (!quota)
    breaker.cooldown = Math.min(breaker.cooldown * 2, MAX_COOLDOWN_MS);
  if (!breaker.loggedOpen) {
    console.warn(
      `[redis] ${quota ? "quota exhausted" : "unavailable"} (${message}); skipping cache for ${Math.round(cooldown / 1000)}s`
    );
    breaker.loggedOpen = true;
  }
}

/** Cheap synchronous check callers can use to skip cache work entirely. */
export function isRedisAvailable(): boolean {
  return client !== null && Date.now() >= breaker.openUntil;
}

async function getReadyClient(): Promise<Redis | null> {
  if (!client || !isRedisAvailable()) return null;
  if (client.status === "ready") return client;
  // Connecting or reconnecting: don't make this request wait on it.
  if (client.status !== "wait" && client.status !== "end") return null;
  try {
    await client.connect();
    return client;
  } catch (err) {
    recordFailure(err);
    return null;
  }
}

async function run<T>(op: (c: Redis) => Promise<T>, fallback: T): Promise<T> {
  const c = await getReadyClient();
  if (!c) return fallback;
  try {
    const result = await op(c);
    if (breaker.failures > 0) recordSuccess();
    return result;
  } catch (err) {
    recordFailure(err);
    return fallback;
  }
}

export async function redisGet<T = unknown>(key: string): Promise<T | null> {
  const raw = await run((c) => c.get(key), null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // A corrupt entry is a cache miss, not an outage.
    return null;
  }
}

export function redisSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<boolean> {
  return run(async (c) => {
    const payload = JSON.stringify(value);
    if (ttlSeconds) await c.set(key, payload, "EX", ttlSeconds);
    else await c.set(key, payload);
    return true;
  }, false);
}

export function redisDel(key: string): Promise<boolean> {
  return run(async (c) => {
    await c.del(key);
    return true;
  }, false);
}

/** Server-only helper; call it through an admin-checked action, never mark it "use server". */
export function flushAllRedisKeys(): Promise<boolean> {
  return run(async (c) => {
    await c.flushall();
    return true;
  }, false);
}
