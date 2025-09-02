// sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

// Declare injection point for precache manifest
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const adAndAnalyticsHosts = [
  "pagead2.googlesyndication.com",
  "tpc.googlesyndication.com",
  "googleads.g.doubleclick.net",
  "securepubads.g.doubleclick.net",
  "www.googletagservices.com",
  "adservice.google.com",
  "adservice.google.co.in",
  "fundingchoicesmessages.google.com",
  "partner.googleadservices.com",
  "www.googletagmanager.com",
  "www.googletagmanager.cn",
  "www.google-analytics.com",
  "ssl.google-analytics.com",
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
   
    // --- Static assets (JS/CSS/JSON) ---
    {
      matcher: ({ request }) =>
        request.destination === "script" ||
        request.destination === "style" ||
        request.destination === "worker",
      handler: defaultCache[0].handler, // same as Serwist default
    },

    // --- Images ---
    {
      matcher: ({ request }) => request.destination === "image",
      handler: defaultCache[1].handler, // default image caching
    },

    // --- Fonts ---
    {
      matcher: ({ request }) => request.destination === "font",
      handler: defaultCache[2].handler,
    },

    // --- API calls (cache-first for GET, pass-through for others) ---
    {
      matcher: ({ url, request }) =>
        url.origin === self.location.origin &&
        url.pathname.startsWith("/api") &&
        request.method === "GET",
      handler: defaultCache[3].handler, // typical stale-while-revalidate
    },

    // --- Everything else falls back to defaults ---
    ...defaultCache,
     // --- Skip Ads & Analytics (always go network) ---
     {
      matcher: ({ url }) => adAndAnalyticsHosts.includes(url.hostname) || url.hostname.includes(".google") || url.hostname.includes("google."),
      handler: new NetworkOnly(),
    },

  ],
});

serwist.addEventListeners();
