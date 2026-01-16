import { config } from "../config";

export function checkCors(origin: string | undefined): boolean {
    if (!origin) return false;
    if(config.isDev) return true;

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
