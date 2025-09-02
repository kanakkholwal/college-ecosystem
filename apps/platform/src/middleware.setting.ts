import { NextRequest } from "next/server";
import type { Session } from "~/auth";
import type { RoutePattern } from "~/utils/string";
import { toRegex } from "~/utils/string";
import { ROLES_ENUMS } from "./constants";
import { appConfig } from "./project.config";

export const SIGN_IN_PATH = "/auth/sign-in";

export const UN_PROTECTED_API_ROUTES = ["/api/auth/*"];

// Define public routes more cleanly
const RAW_PUBLIC_ROUTES: RoutePattern[] = [
  "/", // home
  "/about",
  "/results",
  "/results/:roll",
  "/syllabus",
  "/syllabus/:branch",
  "/classroom-availability",
  "/academic-calendar",
  "/schedules",
  "/schedules/:branch",
  "/schedules/:branch/:year/:semester",
  "/schedules/:branch/:year/:semester/:section",
  "/announcements",
  "/polls",
  "/unauthorized",
  "/community",
  "/community/:postId",
];

export const PUBLIC_ROUTES = RAW_PUBLIC_ROUTES.map((route) => ({
  pattern: toRegex(route),
}));

export const isRouteAllowed = (pathname: string, pathRegex: RegExp) => {
  return pathRegex.test(pathname);
};
export const publicRouteHandleAbsolute = (route: string, pathname: string) => {
  // exact match
  if (pathname === route) return true;

  // allow trailing slash variants
  if (pathname === route.replace(/\/$/, "")) return true;

  // if route ends with /, only match direct children (not nested paths)
  if (route.endsWith("/") && pathname.startsWith(route)) {
    const rest = pathname.slice(route.length);
    return !rest.includes("/"); // no further nesting
  }

  return false;
};

export const dashboardRoutes = [
  ROLES_ENUMS.ADMIN,
  ROLES_ENUMS.FACULTY,
  ROLES_ENUMS.CR,
  ROLES_ENUMS.FACULTY,
  ROLES_ENUMS.CHIEF_WARDEN,
  ROLES_ENUMS.WARDEN,
  ROLES_ENUMS.ASSISTANT_WARDEN,
  ROLES_ENUMS.MMCA,
  ROLES_ENUMS.HOD,
  ROLES_ENUMS.GUARD,
  ROLES_ENUMS.LIBRARIAN,
  ROLES_ENUMS.STUDENT,
];

export type DashboardRoute = (typeof dashboardRoutes)[number];

export const RAW_PRIVATE_ROUTES: RoutePattern[] = [
  ...dashboardRoutes.map((role) => `/${role.toLowerCase()}`),
  ...dashboardRoutes.map((role) => `/${role.toLowerCase()}/*`),
  "/dashboard", // catch-all for dashboard
  "/dashboard/*", // catch-all for dashboard routes
  "/api/*", // catch-all for API routes
  "/announcements/create",
  "/community/create",
  "/community/edit",
  "/whispers/*",
];

export const PRIVATE_ROUTES = RAW_PRIVATE_ROUTES.map((route) => ({
  pattern: toRegex(route),
}));

export const HOSTEL_AUTHORIZED_ROUTES = [
  ROLES_ENUMS.MMCA,
  ROLES_ENUMS.ASSISTANT_WARDEN,
  ROLES_ENUMS.WARDEN,
];
export const HOSTEL_ACCESSED_PATHS = [
  "outpass-requests",
  "outpass-logs",
  "students",
  "rooms",
  "allotment",
  "allotment-by-excel",
];
export const isHostelRoute = (pathname: string) => {
  if (
    pathname.split("/").length < 2 ||
    !HOSTEL_AUTHORIZED_ROUTES.some((role) => pathname.slice(1).startsWith(role))
  ) {
    return {
      isHostelRoute: false,
      route: "",
    };
  }
  const [, , route] = pathname.split("/");
  const path = HOSTEL_ACCESSED_PATHS.find((path) => {
    return route === path;
  });
  return {
    isHostelRoute: !!path,
    route: route,
  };
};

/**
 * Check if the user is authorized to access the given route.
 * @param route_path - The path of the route to check authorization for.
 * @param session - The session object containing user information.
 * @returns An object containing authorization status and redirect information.
 */
export function checkAuthorization(
  route_path: (typeof dashboardRoutes)[number],
  session: Session | null
) {
  // 1. No session, redirect to sign-in
  if (!session) {
    return {
      redirect: { destination: "/auth/sign-in" },
      authorized: false,
      notFound: false,
    };
  }

  // 2. Invalid role
  if (!dashboardRoutes.includes(route_path)) {
    // console.log("Invalid moderator role:", route_path);
    // const destination = session.user.other_roles.includes("student")
    //   ? "/"
    //   : session.user.other_roles[0] || "/";
    const destination =
      session.user.other_roles?.length > 0 ? session.user.other_roles[0] : "/";
    return {
      redirect: { destination },
      authorized: false,
      notFound: false,
    };
  }

  // 4. Authorized check
  if (
    session.user.other_roles
      .map((role) => role.toLowerCase())
      .includes(route_path.toLowerCase()) ||
    session.user.role.toLowerCase() === route_path.toLowerCase()
  ) {
    return {
      notFound: false,
      authorized: true,
      redirect: null,
    };
  }

  return {
    notFound: true,
    authorized: false,
    redirect: null,
  };
}

export const SUBDOMAIN_TO_PATH_REWRITES_Map = new Map<string, string>([
  ["clubs", "clubs-and-societies"],
  ["resources", "resources"],
  ["community", "community"],
  ["auth", "auth"],
  // ["dashboard", "dashboard"],
]);

const POSSIBLE_SUB_ALIAS = ["dev", "platform", "auth", "staging"]

export const auth_SUBDOMAIN_TO_PATH_REWRITES_Map = new Map<
  string,
  {
    path: string;
    roles: string[];
  }
>([
  [
    "guard",
    {
      path: "guard",
      roles: [ROLES_ENUMS.GUARD, ROLES_ENUMS.ADMIN],
    },
  ],
  [
    "admin",
    {
      path: "admin",
      roles: [ROLES_ENUMS.ADMIN],
    },
  ],
  ...POSSIBLE_SUB_ALIAS.map((path) => [path, {
    path: "",
    roles: [],
  }] as [string, { path: string; roles: string[] }])
]);

export function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Local development environment
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = appConfig.appDomain.split(":")[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`) &&
    !appConfig.otherAppDomains.some((domain) => hostname.endsWith(domain));

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}
