"use client";
import { getWindowOrigin } from "@/lib/env";
import { createFetch } from "@better-fetch/fetch";

export const serverIdentity = process.env.NEXT_PUBLIC_SERVER_IDENTITY;
export const baseServerUrl = process.env.NEXT_PUBLIC_BASE_SERVER_URL;
export const baseMailServerUrl = process.env.NEXT_PUBLIC_BASE_MAIL_SERVER_URL;

if (!serverIdentity) {
  throw new Error("Missing environment variables for server identity");
}
if (!baseServerUrl) {
  throw new Error("Missing environment variables for base server URL");
}
export const baseUrl = getWindowOrigin();

export const authHeaders = {
  "Content-Type": "application/json",
  "X-Authorization": serverIdentity,
  "X-Identity-Key": serverIdentity,
  Origin: getWindowOrigin(),
}; /**
 *  a fetch instance to communicate with the server with the necessary headers
 */

export const apiFetch = createFetch({
  baseURL: baseUrl,
  headers: {
    ...authHeaders,
  },
});

/**
 *  a fetch instance to communicate with the server with the necessary headers
 */

export const serverFetch = createFetch({
  baseURL: baseServerUrl,
  cache: "no-store",
  headers: {
    "Content-Type": "application/json",
    "X-Authorization": serverIdentity,
    "X-Identity-Key": serverIdentity,
    Origin: baseUrl,
  },
});
export const mailFetch = createFetch({
  baseURL: baseMailServerUrl,
  headers: {
    "Content-Type": "application/json",
    "X-Authorization": serverIdentity,
    "X-Identity-Key": serverIdentity,
    Origin: getWindowOrigin(),
  },
});
