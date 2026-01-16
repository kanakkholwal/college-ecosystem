import { createFetch } from "@better-fetch/fetch";

const baseServerUrl = process.env.BASE_SERVER_URL;
const baseMailServerUrl = process.env.BASE_MAIL_SERVER_URL;
const serverIdentity = process.env.SERVER_IDENTITY;

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
