import type { BetterFetch } from "@better-fetch/fetch";

export type FetchParams = BetterFetch extends (...args: infer P) => any ? P : never;
export type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "OPTIONS" | "PATCH";

export interface ApiConfigEntry<P, R> {
  url: string;
  method: HttpMethod;
  transformParams?: (payload: P) => Record<string, string | number | undefined>;
  transformBody?: (payload: P) => any;
  transformResponse?: (res: unknown) => R;
  disabled?: boolean;
}

export type ApiConfigMap<T extends Record<string, ApiConfigEntry<any, any>>> = {
  [K in keyof T]: T[K];
};

export function createApiInstance<
  T extends Record<string, ApiConfigEntry<any, any>>,
>(
  fetchInstance: BetterFetch,
  config: T
): {
  [K in keyof T]: (
    payload: T[K] extends ApiConfigEntry<infer P, any> ? P : never
  ) => Promise<T[K] extends ApiConfigEntry<any, infer R> ? R : never>;
} {
  const api = {} as any;

  for (const key of Object.keys(config) as Array<keyof T>) {
    const entry = config[key];
    const { url, method, transformParams, transformBody, transformResponse } =
      entry;

    api[key] = async (payload: any) => {
      let finalUrl = url;

      if (transformParams) {
        const params = transformParams(payload);
        finalUrl = finalUrl.replace(/:(\w+)/g, (_, paramName) =>
          encodeURIComponent(String(params?.[paramName]))
        );
      }

      const rawBody =
        method !== "GET" && payload !== undefined
          ? transformBody
            ? transformBody(payload)
            : payload
          : undefined;

      const body =
        rawBody === undefined ||
        rawBody instanceof FormData ||
        rawBody instanceof URLSearchParams ||
        typeof rawBody === "string"
          ? rawBody
          : JSON.stringify(rawBody);

      const response = await (fetchInstance as any)(finalUrl, {
        method,
        ...(body !== undefined ? { body } : {}),
      });

      const data = (response && (response as any).data) ?? response;
      return transformResponse ? transformResponse(data) : (data as any);
    };
  }

  return api;
}
