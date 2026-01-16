import { betterFetch } from "@better-fetch/fetch";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Session } from "~/auth";
import { IN_CHARGES_EMAILS } from "~/constants/hostel_n_outpass";
import {
  auth_SUBDOMAIN_TO_PATH_REWRITES_Map,
  checkAuthorization,
  dashboardRoutes,
  extractSubdomain,
  isHostelRoute,
  isRouteAllowed,
  PRIVATE_ROUTES,
  SIGN_IN_PATH,
  SUBDOMAIN_TO_PATH_REWRITES_Map,
  UN_PROTECTED_API_ROUTES,
} from "~/middleware.setting";
import { appConfig } from "~/project.config";

// Middleware to handle authentication and authorization for the platform
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [/^https?:\/\/(.+\.)?nith\.eu.org$/] // Regex for subdomains of nith.eu.org
  : ['http://localhost:3000', 'http://localhost:3001']; // Adjust for local development

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = request.nextUrl.pathname;
  const subdomain = extractSubdomain(request);
  const subdomainRestricted = auth_SUBDOMAIN_TO_PATH_REWRITES_Map.get(
    subdomain || ""
  );

  if (subdomain && !subdomainRestricted) {
    // Block access to admin page from subdomains
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // For the root path on a subdomain, rewrite to the subdomain page
    const subDomainPath = SUBDOMAIN_TO_PATH_REWRITES_Map.get(subdomain);
    if (subDomainPath) {
      // If the subdomain has a defined path, rewrite to that path
      // console.log(`Rewriting request for subdomain: ${subdomain} to path: ${subDomainPath} :`,`/${subDomainPath}${pathname}`);

      return NextResponse.rewrite(
        new URL(`/${subDomainPath}${pathname}`, request.url)
      );
    }
    // dynamically handle the root path for clubs
    if (pathname === "/") {
      return NextResponse.rewrite(new URL(`/clubs/${subdomain}`, request.url));
    }
  }
  const searchParams = request.nextUrl.searchParams;
  const isPrivateRoute = PRIVATE_ROUTES.some((route) =>
    isRouteAllowed(pathname, route.pattern)
  );

  // if the request is for the sign-in page, allow it to pass through
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        //get the cookie from the request
        cookie: request.headers.get("cookie") || "",
      },
    }
  );
  if (subdomainRestricted && session) {
    if (
      subdomainRestricted &&
      (subdomainRestricted.roles.includes(session.user.role) ||
        subdomainRestricted.roles.some((role) =>
          session.user.other_roles.includes(role)
        ))
    ) {
      // If the user is authenticated and has access to the subdomain, rewrite the path
      // console.log(`Rewriting request for subdomain: ${subdomain} to path: ${subdomainRestricted.path}`);
      return NextResponse.rewrite(
        new URL(`/${subdomainRestricted.path}${pathname}`, request.url)
      );
    }
  }
  // Exception for the error page : Production issue on Google Sign in
  if (pathname === "/api/auth/error" && session) {
    console.log(pathname, "is accessed by an authenticated user");
    const error = request.nextUrl.searchParams.get("error");
    // api/auth/error?error=please_restart_the_process
    if (error === "please_restart_the_process") {
      // if the user is authenticated and tries to access the error page, redirect them to the home page
      url.pathname = "/";
      url.search = url.searchParams.toString();
      return NextResponse.redirect(url);
    }
    if (error) {
      url.pathname = SIGN_IN_PATH;
      url.search = url.searchParams.toString();
      return NextResponse.redirect(url);
      // Handle other specific error cases
    }
  }
  if (isPrivateRoute) {
    // console.log("Private route accessed:", pathname);
    if (
      session &&
      !UN_PROTECTED_API_ROUTES.some((route) =>
        new RegExp(route.replace(/\*/g, ".*")).test(request.nextUrl.pathname)
      )
    ) {
      // if the user is authenticated and tries to access a private route, allow it to pass through
      const protectedPaths = dashboardRoutes.map((role) => `/${role}`);
      const matchedRole = protectedPaths
        .find((path) => request.nextUrl.pathname.startsWith(path))
        ?.slice(1) as (typeof dashboardRoutes)[number];
      if (matchedRole) {
        const authCheck = checkAuthorization(matchedRole, session);

        if (!authCheck.authorized) {
          if (request.method === "GET") {
            return NextResponse.redirect(
              new URL(
                `/unauthorized?target=${encodeURIComponent(request.nextUrl.pathname)}`,
                request.nextUrl.origin
              )
            );
          }
          if (request.method === "POST") {
            console.log(
              "Unauthorized POST request to:",
              request.nextUrl.pathname
            );
            return NextResponse.json(
              {
                status: "error",
                message: "You are not authorized to perform this action",
                data: null,
              },
              {
                status: 403,
                headers: {
                  "Un-Authorized-Redirect": "true",
                  "Un-Authorized-Redirect-Path": SIGN_IN_PATH,
                  "Un-Authorized-Redirect-Next": request.nextUrl.href,
                  "Un-Authorized-Redirect-Method": request.method,
                  "Un-Authorized-Redirect-max-tries": "5",
                  "Un-Authorized-Redirect-tries": "1",
                  "Content-Type": "application/json",
                },
              }
            );
          }
        }
        if (authCheck.redirect?.destination) {
          console.log("Redirecting to:", authCheck.redirect.destination);
          // if the user is authenticated and tries to access a protected route, redirect them to the appropriate page
          return NextResponse.redirect(
            new URL(authCheck.redirect.destination, request.url)
          );
        }
        // Special redirect: /dashboard -> /<first-role>
        if (request.nextUrl.pathname.startsWith("/dashboard")) {
          return NextResponse.redirect(
            new URL(
              request.nextUrl.pathname.replace(
                "/dashboard",
                session?.user.other_roles[0]
              ),
              request.url
            )
          );
        }
        const hostelRoute = isHostelRoute(pathname);
        // console.log("Hostel Route Check:", hostelRoute, pathname);
        if (
          hostelRoute.isHostelRoute &&
          session.user.hostelId &&
          searchParams.get("hostel_slug")
        ) {
          // Temporary fix for the hostel slug issue
          // This should be replaced with a proper slug to ID mapping in the future
          const hostelSlug = searchParams.get("hostel_slug") || "";
          // console.log("Hostel slug Check:", hostelSlug);
          const hostel = IN_CHARGES_EMAILS.find(
            (hostel) => hostel.slug === hostelSlug
          );
          if (hostel) {
            // request.headers.set("hostelSlug", hostelSlug);
            return NextResponse.rewrite(
              new URL(
                `/${matchedRole}/hostels/${hostel.slug}/${hostelRoute.route}`,
                request.url
              )
            );
          }
        }
      }
      return NextResponse.next();
    }
    // if the user is not authenticated and tries to access a private route, redirect them to the sign-in page
    url.pathname = SIGN_IN_PATH;
    url.searchParams.set("next", request.url);
    return NextResponse.redirect(url);
  }
  if (session) {
    if (pathname === SIGN_IN_PATH) {
      url.pathname = "/";
      url.search = url.searchParams.toString();
      // if the user is already authenticated and tries to access the sign-in page, redirect them to the home page
      return NextResponse.redirect(url);
    }
  }

  // nextTargetRoute is used to redirect the user to the page they were trying to access before being redirected to the sign-in page
  const nextTargetRoute = request.nextUrl.searchParams.get("next");
  // if the user is already authenticated and tries to access the sign-in page, redirect them to the home page
  if (nextTargetRoute) {
    const targetUrl = decodeURIComponent(nextTargetRoute);
    // console.log("targetUrl", targetUrl);
    const nextRedirect = request.nextUrl.searchParams.get("redirect");

    if (targetUrl && nextRedirect !== "false" && session) {
      const targetUrlObj = new URL(targetUrl, appConfig.url);
      return NextResponse.redirect(targetUrlObj);
    }
  }

  return NextResponse.next();
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
    "/((?!api|_next/static|_next/image|assets|favicon.ico|manifest.webmanifest|ads.txt|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|json|xml|js)).*)",
    // Explicitly include /api/auth/error
    "/api/auth/error",
  ],
};
