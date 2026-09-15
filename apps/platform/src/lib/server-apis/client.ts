import { serverFetch } from "~/lib/fetch-client";
import { createApiInstance } from "./base-api";
import endpoints from "./endpoints";
/*
 **  Result APIs
 */

export const results = createApiInstance(serverFetch, endpoints.results);
export const hostels = createApiInstance(serverFetch, endpoints.hostels);
export const faculties = createApiInstance(serverFetch, endpoints.faculties);
export const departments = createApiInstance(
  serverFetch,
  endpoints.departments
);

/*
 **  Exports
 */

const serverApis = {
  results,
  hostels,
  faculties,
  departments,
} as const;

export default serverApis;
