
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { appConfig } from "./project.config";

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("Origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, X-Authorization, X-Identity-Key, Authorization, X-CSRF-Token, X-Requested-With, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.SERVER_IDENTITY;

  return Boolean(
    expected &&
      request.headers.get("X-Authorization") === expected
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname === "/api" || pathname.startsWith("/api/");
  const origin = request.headers.get("Origin");
  const corsHeaders = getCorsHeaders(request);

  if (isApiRoute) {
    if (origin && !allowedOrigins.has(origin)) {
      return NextResponse.json(
        { error: "Origin not allowed", data: null },
        { status: 403 }
      );
    }

    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (!isAuthorized(request)) {
      return NextResponse.json(
        {
          error: "Missing or invalid SERVER_IDENTITY",
          data: null,
        },
        { status: 403, headers: corsHeaders }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.json(
    {
      message: "Campus 360 local mail service",
      ok: true,
    },
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Application-Name": appConfig.name,
      },
    }
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.next/static).*)",
  ],
};
