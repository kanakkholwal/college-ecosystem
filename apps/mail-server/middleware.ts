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

export async function middleware(request: NextRequest) {


  if (request.nextUrl.pathname.startsWith("/api")) {
    const newHeaders = new Headers(request.headers)
    // Set CORS headers for all non-API requests
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    const headers = request.headers.get("X-Authorization") || "";
    if (headers !== process.env.SERVER_IDENTITY) {
      return NextResponse.json(
        {
          error: "Missing or invalid SERVER_IDENTITY",
          data: null,
        },
        { status: 403, headers: newHeaders }
      );
    }
    return NextResponse.next({
      request: {
        // New request headers
        headers: newHeaders,
      },
    })
  }

  return NextResponse.redirect(
    appConfig.url + "?utm_source=mail-server-middleware"
  )
}
// the following code has been copied from https://nextjs.org/docs/advanced-features/middleware#matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.manifest (manifest file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|.next/static).*)",
  ],
};
