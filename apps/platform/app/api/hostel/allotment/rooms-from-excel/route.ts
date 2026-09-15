import type { NextRequest } from "next/server";
import { serverConnection } from "~/lib/fetch-server";
import { authorizeHostelManager } from "~/lib/hostel-access";

export const dynamic = "force-dynamic";

/** Forwards a warden's room-allotment sheet to apps/server with the server identity, which stays server-side. */
export async function POST(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return Response.json(
      { error: true, message: "No hostel given", data: null },
      { status: 400 }
    );
  }
  const access = await authorizeHostelManager(slug);
  if (!access.ok) {
    return Response.json(
      { error: true, message: access.error, data: null },
      { status: access.status }
    );
  }
  const connection = serverConnection();
  if (!connection) {
    return Response.json(
      {
        error: true,
        message: "This app isn't configured to reach the allotment server.",
        data: null,
      },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { error: true, message: "Send the sheet as a file upload", data: null },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(
      new URL("/api/hostels/allotment/rooms-from-excel", connection.baseUrl),
      {
        method: "POST",
        body: form,
        headers: { "X-Authorization": connection.identity },
        cache: "no-store",
      }
    );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (err) {
    console.error("[rooms-from-excel] allotment server unreachable", err);
    return Response.json(
      {
        error: true,
        message:
          "Couldn't reach the allotment server. It may be down; try again in a minute.",
        data: null,
      },
      { status: 502 }
    );
  }
}
