import { betterAuth } from "better-auth";
import { toNextJsHandler } from "better-auth/next-js";
import { type NextRequest } from "next/server";
import { betterAuthOptions } from "~/auth";
import { appConfig } from "~/project.config";
import { getServerEnv } from "~/utils/env";

const authHandler = toNextJsHandler(betterAuth(betterAuthOptions));

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (getServerEnv().isDev) {
      return origin.includes("localhost") || origin.includes("127.0.0.1");
    }

    return (
      url.hostname.endsWith("." + appConfig.appDomain) ||
      url.hostname === appConfig.appDomain
    );
  } catch {
    return false;
  }
}

function withCors(handler: (request: NextRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    // Only the Origin header is a valid Allow-Origin value; req.url carries a path.
    const origin = req.headers.get("origin");
    const allowOrigin = origin && isAllowedOrigin(origin) ? origin : "";
    const res = await handler(req);
    res.headers.append("Vary", "Origin");
    if (allowOrigin) {
      res.headers.set("Access-Control-Allow-Origin", allowOrigin);
      res.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS,DELETE"
      );
      res.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      res.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return res;
  };
}

export const GET = withCors(authHandler.GET);
export const POST = withCors(authHandler.POST);

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : "";
  const res = new Response(null, { status: 204 }); // no content
  res.headers.append("Vary", "Origin");
  if (allowOrigin) {
    res.headers.set("Access-Control-Allow-Origin", allowOrigin);
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, DELETE"
    );
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}
