import { createHash } from "node:crypto";
import { createFetch } from "@better-fetch/fetch";

type Fetcher = ReturnType<typeof createFetch>;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function authHeaders() {
  // Trimmed because secret stores often add a trailing newline; apps/server trims too.
  const identity = requireEnv("SERVER_IDENTITY").trim();
  const hash = createHash("sha256").update(identity).digest("hex").slice(0, 8);
  // Matches apps/server's "[identity] expecting" line; compare the two to spot a mismatch.
  console.info(`[identity] sending len=${identity.length} sha256=${hash}`);
  return {
    "Content-Type": "application/json",
    "X-Authorization": identity,
  };
}

// Instantiated on first call, never on import: DB-only routes would otherwise
// fail Next's build-time page-data collection without these vars set.
function lazyFetch(baseUrlEnv: string): Fetcher {
  let instance: Fetcher | null = null;
  // biome-ignore lint/suspicious/noExplicitAny: forwarding to a generic signature
  return ((...args: any[]) => {
    if (!instance) {
      const baseURL = requireEnv(baseUrlEnv);
      console.info(`[server-fetch] ${baseUrlEnv}=${baseURL}`);
      instance = createFetch({
        baseURL,
        headers: authHeaders(),
      });
    }
    // biome-ignore lint/suspicious/noExplicitAny: forwarding to a generic signature
    return (instance as any)(...args);
  }) as Fetcher;
}

/** Base URL and identity for raw `fetch` calls to `apps/server` (streams, uploads); null when unset. */
export function serverConnection(): {
  baseUrl: string;
  identity: string;
} | null {
  const read = (name: string) => process.env[name]?.trim();
  const baseUrl = read("BASE_SERVER_URL");
  const identity = read("SERVER_IDENTITY");
  return baseUrl && identity ? { baseUrl, identity } : null;
}

/** Calls `apps/server`; throws only when invoked without the required env. */
export const serverFetch = lazyFetch("BASE_SERVER_URL");
