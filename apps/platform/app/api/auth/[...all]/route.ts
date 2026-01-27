// app/api/auth/[...all]/route.ts
import { betterAuth } from "better-auth";
import { toNextJsHandler } from "better-auth/next-js";
import { type NextRequest } from "next/server";
import { betterAuthOptions } from "~/auth";
import { appConfig } from "~/project.config";
// export const { POST, GET } = toNextJsHandler(auth);
// import { headers } from 'next/headers'

const authHandler = toNextJsHandler(betterAuth(betterAuthOptions));

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (process.env.NODE_ENV !== "production") {
      return origin.includes("localhost") || origin.includes("127.0.0.1")
    }
    return url.hostname.endsWith("." + appConfig.appDomain) || url.hostname === appConfig.appDomain;
  } catch {
    return false;
  }
}

function withCors(handler: (request: NextRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    // const headerList = await headers()
    const origin = req.headers.get("origin") || req.url;
    const allowOrigin = isAllowedOrigin(origin) ? origin : "";
    const res = await handler(req);
    if (allowOrigin) {
      res.headers.set("Access-Control-Allow-Origin", allowOrigin);
      res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS,DELETE");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return res;
  };
}

export const GET = withCors(authHandler.GET);
export const POST = withCors(authHandler.POST);

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || req.url;
  const allowOrigin = isAllowedOrigin(origin) ? origin : "";
  const res = new Response(null, { status: 204 }); // no content
  if (allowOrigin) {
    res.headers.set("Access-Control-Allow-Origin", allowOrigin);
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}
