import type { ApiConfigEntry, ApiConfigMap } from "./base-api";
import type { ApiResponse, APITypes } from "./types";
/*
 **  Result APIs
 */
export type Endpoints = {
  results: ApiConfigMap<{
    [K in keyof APITypes["results"]]: ApiConfigEntry<
      APITypes["results"][K]["payload"],
      ApiResponse<APITypes["results"][K]["response"]>
    >;
  }>;
  hostels: ApiConfigMap<{
    [K in keyof APITypes["hostels"]]: ApiConfigEntry<
      APITypes["hostels"][K]["payload"],
      ApiResponse<APITypes["hostels"][K]["response"]>
    >;
  }>;
  faculties: ApiConfigMap<{
    [K in keyof APITypes["faculties"]]: ApiConfigEntry<
      APITypes["faculties"][K]["payload"],
      ApiResponse<APITypes["faculties"][K]["response"]>
    >;
  }>;
  departments: ApiConfigMap<{
    [K in keyof APITypes["departments"]]: ApiConfigEntry<
      APITypes["departments"][K]["payload"],
      ApiResponse<APITypes["departments"][K]["response"]>
    >;
  }>;
  mail: ApiConfigMap<{
    [K in keyof APITypes["mail"]]: ApiConfigEntry<
      APITypes["mail"][K]["payload"],
      ApiResponse<APITypes["mail"][K]["response"]>
    >;
  }>;
};
const results: Endpoints["results"] = {
  importFreshers: {
    url: "/api/results/import-freshers",
    method: "POST",
    transformBody: (payload) => payload,
    transformResponse: (res) =>
      res as ApiResponse<APITypes["results"]["importFreshers"]["response"]>,
  },
  assignRank: {
    url: "/api/results/assign-ranks",
    method: "POST",
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["results"]["assignRank"]["response"]>,
  },
  assignBranchChange: {
    url: "/api/results/assign-branch-change",
    method: "POST",
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["results"]["assignBranchChange"]["response"]>,
  },
  getResultByRollNoFromSite: {
    url: "/api/results/:rollNo/scrape",
    method: "POST",
    transformParams: (payload) => ({
      rollNo: payload,
    }),
    transformResponse: (res: unknown) =>
      res as ApiResponse<
        APITypes["results"]["getResultByRollNoFromSite"]["response"]
      >,
  },
  getResultByRollNo: {
    url: "/api/results/:rollNo",
    method: "GET",
    transformParams: (
      payload: APITypes["results"]["getResultByRollNo"]["payload"]
    ) => ({
      rollNo: payload,
    }),
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["results"]["getResultByRollNo"]["response"]>,
  },
  deleteResultByRollNo: {
    url: "/api/results/:rollNo",
    method: "DELETE",
    transformParams: (
      payload: APITypes["results"]["deleteResultByRollNo"]["payload"]
    ) => ({
      rollNo: payload,
    }),
    transformResponse: (res: unknown) =>
      res as ApiResponse<
        APITypes["results"]["deleteResultByRollNo"]["response"]
      >,
  },
  addResultByRollNo: {
    url: "/api/results/:rollNo",
    method: "POST",
    transformParams: (
      payload: APITypes["results"]["addResultByRollNo"]["payload"]
    ) => ({
      rollNo: payload,
    }),
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["results"]["addResultByRollNo"]["response"]>,
  },
  updateResultByRollNo: {
    url: "/api/results/:rollNo",
    method: "PUT",
    transformParams: (
      payload: APITypes["results"]["updateResultByRollNo"]["payload"]
    ) => ({
      rollNo: payload[0],
    }),
    transformBody: (
      payload: APITypes["results"]["updateResultByRollNo"]["payload"]
    ) => payload[1],
    transformResponse: (res: unknown) =>
      res as ApiResponse<
        APITypes["results"]["updateResultByRollNo"]["response"]
      >,
  },
  getAbnormalResults: {
    url: "/api/results/abnormals",
    method: "GET",
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["results"]["getAbnormalResults"]["response"]>,
  },
  deleteAbNormalResults: {
    url: "/api/results/abnormals",
    method: "DELETE",
    transformResponse: (res: unknown) =>
      res as ApiResponse<
        APITypes["results"]["deleteAbNormalResults"]["response"]
      >,
  },
  bulkUpdateResults: {
    url: "/api/results/bulk-update",
    method: "POST",
    transformBody: (
      payload: APITypes["results"]["bulkUpdateResults"]["payload"]
    ) => payload,
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["results"]["bulkUpdateResults"]["response"]>,
  },
  bulkDeleteResults: {
    url: "/api/results/bulk-delete",
    method: "POST",
    transformBody: (
      payload: APITypes["results"]["bulkDeleteResults"]["payload"]
    ) => payload,
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["results"]["bulkDeleteResults"]["response"]>,
  },
} as const;

/*
 **  Hostel APIs
 */

export const hostels: Endpoints["hostels"] = {
  getAll: {
    url: "/api/hostels",
    method: "GET",
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["hostels"]["getAll"]["response"]>,
  },
  allotRoomsFromExcel: {
    url: "/api/hostels/allotment/rooms-from-excel",
    method: "POST",
    transformBody: (
      payload: APITypes["hostels"]["allotRoomsFromExcel"]["payload"]
    ) => payload,
    transformResponse: (res: unknown) =>
      res as ApiResponse<
        APITypes["hostels"]["allotRoomsFromExcel"]["response"]
      >,
  },
} as const;

/*
 **  Faculties APIs
 */

export const faculties: Endpoints["faculties"] = {
  searchByEmail: {
    url: "/api/faculties/search/:email",
    method: "GET",
    transformParams: (
      payload: APITypes["faculties"]["searchByEmail"]["payload"]
    ) => ({
      email: payload,
    }),
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["faculties"]["searchByEmail"]["response"]>,
  },
  refresh: {
    url: "/api/faculties/refresh",
    method: "GET",
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["faculties"]["refresh"]["response"]>,
  },
  getByDepartment: {
    url: "/api/faculties/:departmentCode",
    method: "GET",
    transformParams: (
      payload: APITypes["faculties"]["getByDepartment"]["payload"]
    ) => ({
      departmentCode: payload,
    }),
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["faculties"]["getByDepartment"]["response"]>,
  },
} as const;

/*
 **  Departments API
 */

export const departments: Endpoints["departments"] = {
  getAll: {
    url: "/api/departments",
    method: "GET",
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["departments"]["getAll"]["response"]>,
  },
  getList: {
    url: "/api/departments/list",
    method: "GET",
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["departments"]["getList"]["response"]>,
  },
} as const;

/*
 **  Mail API
 */
export const mail: Endpoints["mail"] = {
  sendResultUpdate: {
    url: "/api/send",
    method: "POST",
    transformBody: (payload: APITypes["mail"]["sendResultUpdate"]["payload"]) =>
      payload,
    transformResponse: (res: unknown) =>
      res as ApiResponse<APITypes["mail"]["sendResultUpdate"]["response"]>,
  },
} as const;

/*
 **  Exports
 */

const serverApis = {
  results,
  hostels,
  faculties,
  departments,
  mail,
} as const;

export default serverApis;
