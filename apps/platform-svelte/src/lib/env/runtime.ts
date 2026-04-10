import { browser, building, dev } from '$app/environment';

export type Runtime = 'browser' | 'node' | 'edge';

export const getRuntime = (): Runtime => {
    if (browser) return 'browser';

    const isEdge = typeof globalThis !== 'undefined' &&
        // Cloudflare / Vercel Edge indicators
        ('WebSocketPair' in globalThis || 'EdgeRuntime' in globalThis);

    if (isEdge) return 'edge';
    return 'node';
};

export const isBrowser = browser;
export const isDev = dev;
export const isBuilding = building;