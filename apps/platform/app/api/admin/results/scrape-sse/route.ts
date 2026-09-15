import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { auth } from "~/auth";
import { isAdminLike } from "~/auth/guards";
import { serverConnection } from "~/lib/fetch-server";

export const dynamic = "force-dynamic";

const FORWARDED_PARAMS = ["list_type", "action", "task_resume_id"];

/** Streams apps/server's scrape SSE to an admin browser, so the server identity never leaves this app. */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isAdminLike(session.user)) {
    return Response.json(
      { data: null, error: "You need an admin session to run scrapes." },
      { status: 403 }
    );
  }
  const connection = serverConnection();
  if (!connection) {
    return Response.json(
      { data: null, error: "This app isn't configured to reach the results server." },
      { status: 500 }
    );
  }

  const { baseUrl, identity } = connection;
  const upstreamUrl = new URL("/api/results/scrape-sse", baseUrl);
  for (const key of FORWARDED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) upstreamUrl.searchParams.set(key, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      headers: {
        "X-Authorization": identity,
        Accept: "text/event-stream",
        // The server allows one stream per client; key it on the admin, not on this app's IP.
        "X-Client-Id": session.user.id,
      },
      // Closing the tab aborts this fetch, which lets the server release the task lock.
      signal: request.signal,
      cache: "no-store",
    });
  } catch (err) {
    console.error("[scrape-sse] results server unreachable", err);
    return Response.json(
      { data: null, error: "The results server is down or unreachable." },
      { status: 502 }
    );
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") ?? "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
