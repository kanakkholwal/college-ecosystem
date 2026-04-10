import { createFetch } from "@better-fetch/fetch";
import { env } from "$env/dynamic/private";

const baseServerUrl = env.BASE_SERVER_URL;
const baseMailServerUrl = env.BASE_MAIL_SERVER_URL;
const serverIdentity = env.SERVER_IDENTITY;

if (!baseServerUrl || !serverIdentity || !baseMailServerUrl) {
  throw new Error("Missing environment variables");
}

/**
 *  a fetch instance to communicate with the server with the necessary headers
 */

export const authHeaders = {
  "Content-Type": "application/json",
  "X-Authorization": serverIdentity,
};
export const serverFetch = createFetch({
  baseURL: baseServerUrl,
  headers: { ...authHeaders },
});

export const mailFetch = createFetch({
  baseURL: baseMailServerUrl,
  headers: { ...authHeaders },
});
