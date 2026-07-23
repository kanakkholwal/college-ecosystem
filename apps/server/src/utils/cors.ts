import { config } from "../config";

const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1", "[::1]"];

export function checkCors(origin: string | undefined): boolean {
    if (!origin) return false;

    // Dev runs the apps on assorted localhost ports; everything else still goes
    // through the same checks below, so local behaviour matches production.
    if (config.isDev) {
        try {
            if (LOCAL_HOSTNAMES.includes(new URL(origin).hostname)) return true;
        } catch {
            return false;
        }
    }

    for (const allowedOrigin of config.corsOrigins) {
        // Exact match
        if (origin === allowedOrigin) return true;

        try {
            const { hostname, protocol } = new URL(allowedOrigin);
            const originUrl = new URL(origin);

            // Protocol must match
            if (originUrl.protocol !== protocol) continue;

            // Allow subdomains of allowed hostname
            if (
                originUrl.hostname === hostname ||
                originUrl.hostname.endsWith(`.${hostname}`)
            ) {
                return true;
            }
        } catch {
            continue;
        }
    }

    return false;
}
