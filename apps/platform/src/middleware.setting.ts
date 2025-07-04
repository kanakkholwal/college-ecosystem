import { ROLES } from "~/constants";
import type { Session } from "~/lib/auth";
import type { RoutePattern } from "~/utils/string";
import { toRegex } from "~/utils/string";


export const SIGN_IN_PATH = "/sign-in";

export const UN_PROTECTED_API_ROUTES = [
    "/api/auth/*",
];



// Define public routes more cleanly
const RAW_PUBLIC_ROUTES: RoutePattern[] = [
    "/",               // home
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
    "/community/:postId"
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
}


export const dashboardRoutes = [
    ROLES.ADMIN,
    ROLES.FACULTY,
    ROLES.CR,
    ROLES.FACULTY,
    ROLES.CHIEF_WARDEN,
    ROLES.WARDEN,
    ROLES.ASSISTANT_WARDEN,
    ROLES.MMCA,
    ROLES.HOD,
    ROLES.GUARD,
    ROLES.LIBRARIAN,
    ROLES.STUDENT,
];

export type DashboardRoute = (typeof dashboardRoutes)[number];

export const RAW_PRIVATE_ROUTES: RoutePattern[] = [
    ...dashboardRoutes.map(role => `/${role.toLowerCase()}`),
    ...dashboardRoutes.map(role => `/${role.toLowerCase()}/*`),
    "/dashboard", // catch-all for dashboard
    "/dashboard/*", // catch-all for dashboard routes
    "/api/*", // catch-all for API routes
    "/announcements/create",
    "/community/create",
    "/community/edit",
];

export const PRIVATE_ROUTES = RAW_PRIVATE_ROUTES.map((route) => ({
    pattern: toRegex(route),
}));

export const HOSTEL_AUTHORIZED_ROUTES = [
    ROLES.MMCA,
    ROLES.ASSISTANT_WARDEN,
    ROLES.WARDEN,
];
export const HOSTEL_ACCESSED_PATHS = [
    "outpass-requests",
    "outpass-logs",
    "students",
    "rooms",
    "allotment",
    "allotment-by-excel"
];
export const isHostelRoute = (pathname: string) => {
    if (pathname.split("/").length < 2 || !HOSTEL_AUTHORIZED_ROUTES.some((role) => pathname.slice(1).toLowerCase().startsWith(role.toLowerCase()))) {
        return {
            isHostelRoute: false,
            route: ""
        };
    }
    const [,,route] = pathname.split("/");
    const path = HOSTEL_ACCESSED_PATHS.find((path) => {
            return route.toLowerCase() === path.toLowerCase();
        })
    return {
        isHostelRoute: !!path,
        route: route
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
            redirect: { destination: "/sign-in" },
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