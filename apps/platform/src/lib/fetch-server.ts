import { createFetch } from "@better-fetch/fetch";

type Fetcher = ReturnType<typeof createFetch>;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Authorization": requireEnv("SERVER_IDENTITY"),
  };
}

// Instantiated on first call, never on import: DB-only routes would otherwise
// fail Next's build-time page-data collection without these vars set.
function lazyFetch(baseUrlEnv: string): Fetcher {
  let instance: Fetcher | null = null;
  // biome-ignore lint/suspicious/noExplicitAny: forwarding to a generic signature
  return ((...args: any[]) => {
    if (!instance) {
      instance = createFetch({
        baseURL: requireEnv(baseUrlEnv),
        headers: authHeaders(),
      });
    }
    // biome-ignore lint/suspicious/noExplicitAny: forwarding to a generic signature
    return (instance as any)(...args);
  }) as Fetcher;
}

/** Calls `apps/server`; throws only when invoked without the required env. */
export const serverFetch = lazyFetch("BASE_SERVER_URL");

/** Calls `apps/mail-server`; throws only when invoked without the required env. */
export const mailFetch = lazyFetch("BASE_MAIL_SERVER_URL");
