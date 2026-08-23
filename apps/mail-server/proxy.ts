import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { appConfig } from "./project.config";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Authorization,X-Identity-Key, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
  "Access-Control-Max-Age": "86400",
};

// Fails closed when SERVER_IDENTITY is unset, so a misconfigured deploy cannot
// leave /api/send open as an unauthenticated relay.
function isAuthorized(request: NextRequest) {
  const expected = process.env.SERVER_IDENTITY;
  if (!expected) return false;
  return request.headers.get("X-Authorization") === expected;
}

export async function proxy(request: NextRequest) {


  if (request.nextUrl.pathname.startsWith("/api")) {
    // Preflight never carries X-Authorization, so it has to bypass the check.
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
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

  return NextResponse.json({
    message: "This is a proxy server for the mail server application.",
    ok: true,
  },{
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Application-Name": appConfig.name,
    },
  },)
}
// Matcher syntax: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
export const config = {
  matcher: [
    // /api is deliberately NOT excluded: the SERVER_IDENTITY check above runs on it.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.next/static).*)",
  ],
};
