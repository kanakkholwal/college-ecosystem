/**
 * Detects the current execution runtime.
 *
 * Possible values:
 * - 'browser' -> Client Components, browser execution
 * - 'node'    -> Server Components, Route Handlers, Node runtime
 * - 'unknown' -> Fallback
 *
 */
export const getRuntime = (): "browser" | "node" | "unknown" => {
  // Browser runtime
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return "browser";
  }

  // Node.js runtime (default server runtime)
  if (
    typeof process !== "undefined" &&
    typeof process?.versions !== "undefined"
  ) {
    return "node";
  }

  return "unknown";
};

/**
 * True when executing in the browser.
 */
export const isBrowser = (): boolean => getRuntime() === "browser";

/**
 * True when executing in the Node.js server runtime.
 */
export const isNode = (): boolean => getRuntime() === "node";

//  Environment detection

/**
 * Reads deployment environment on the server.
 *
 * Uses:
 * - VERCEL_ENV -> 'production' | 'preview' | 'development'
 * - NODE_ENV   -> 'production' | 'development' | 'test'
 *
 * This is server-only and must never be imported into client code.
 */
export const getServerEnv = () => {
  const vercelEnv = process.env.VERCEL_ENV;
  const nodeEnv = process.env.NODE_ENV;

  return {
    /**
     * Vercel deployment environment.
     */
    vercel: vercelEnv ?? "unknown",

    /**
     * Node.js build environment.
     */
    node: nodeEnv ?? "unknown",

    /**
     * True in production deployments.
     */
    isProd: vercelEnv === "production" || nodeEnv === "production",

    /**
     * True in preview deployments.
     */
    isPreview: vercelEnv === "preview",

    /**
     * True in local development.
     */
    isDev: vercelEnv === "development" || nodeEnv === "development",
  };
};

/**
 * Reads deployment environment on the client.
 *
 * TODO: In SvelteKit, public env vars use the PUBLIC_ prefix and are
 * accessed via `import { env } from '$env/dynamic/public'` or
 * `import { PUBLIC_VERCEL_ENV } from '$env/static/public'`.
 * Update this function to use SvelteKit's env modules instead of process.env.
 */
export const getClientEnv = () => {
  // TODO: Replace with SvelteKit env import:
  // import { env } from '$env/dynamic/public';
  // const envValue = env.PUBLIC_VERCEL_ENV;
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;

  return {
    /**
     * Vercel deployment environment (mirrored).
     */
    vercel: env ?? "unknown",

    /**
     * True in production builds.
     */
    isProd: env === "production",

    /**
     * True in preview builds.
     */
    isPreview: env === "preview",

    /**
     * True in development builds.
     */
    isDev: env === "development",
  };
};

// ---------- Unified helper ----------

/**
 * Returns a unified execution context combining:
 * - runtime  -> browser | node
 * - environment -> prod | preview | dev
 *
 * Behavior:
 * - In browser -> reads client env
 * - On server  -> reads VERCEL_ENV / NODE_ENV
 *
 * This is the only helper you should use in shared code.
 */
export const getExecutionContext = () => {
  const runtime = getRuntime();

  if (runtime === "browser") {
    return {
      runtime,
      ...getClientEnv(),
    };
  }

  return {
    runtime,
    ...getServerEnv(),
  };
};

/**
* Get canonical base URL for the current execution.
*
* Rules:
* - Browser -> derive from window.location
* - Server on Vercel -> use deployment env vars
* - Local dev -> http://localhost:5173 (SvelteKit default)
* - Never guess from runtime, only from request or env
* - fallback to `BETTER_AUTH_URL`
*/
export const getBaseURL = () => {
  const ctx = getExecutionContext();

  // Browser: trust the actual origin
  if (ctx.runtime === "browser") {
    return window.location.origin;
  }

  // Server

  // Vercel production / preview
  if (process.env.VERCEL === "1") {
    const host =
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_PROJECT_PREVIEW_URL ||
      process.env.VERCEL_URL;

    if (host) {
      return `https://${host}`;
    }
  }

  // Explicit override always wins
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }

  // Local fallback (SvelteKit default port)
  return "http://localhost:5173";
};

/**
 * Get backend API URL from current app domain.
 */

export const getServerURL = async () => {
  const runtime = getRuntime();

  //  Explicit override
  if (runtime !== "browser" && process.env.BASE_SERVER_URL) {
    return process.env.BASE_SERVER_URL;
  }

  // TODO: Replace NEXT_PUBLIC_BASE_SERVER_URL with PUBLIC_BASE_SERVER_URL
  // and use SvelteKit's $env/dynamic/public for client-side access
  if (runtime === "browser" && process.env.NEXT_PUBLIC_BASE_SERVER_URL) {
    return process.env.NEXT_PUBLIC_BASE_SERVER_URL;
  }

  return "http://localhost:8080";
};
