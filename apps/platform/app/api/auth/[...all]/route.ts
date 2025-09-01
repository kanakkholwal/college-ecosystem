// app/api/auth/[...all]/route.ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "~/auth";
// import { NextResponse } from "next/server";

export const { POST, GET } = toNextJsHandler(auth);

// const authHandler = toNextJsHandler(auth);

// function isAllowedOrigin(origin: string | null) {
//   if (!origin) return false;
//   try {
//     const url = new URL(origin);
//     return url.hostname.endsWith(".nith.eu.org") || url.hostname === "nith.eu.org";
//   } catch {
//     return false;
//   }
// }

// function withCors(handler: (request: Request) => Promise<Response>) {
//   return async (req: Request) => {
//     const origin = req.headers.get("origin");
//     const allowOrigin = isAllowedOrigin(origin) ? origin : "";

//     if (req.method === "OPTIONS") {
//       return new NextResponse(null, {
//         status: 204,
//         headers: {
//           "Access-Control-Allow-Origin": allowOrigin,
//           "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//           "Access-Control-Allow-Headers": "Content-Type, Authorization",
//         },
//       });
//     }

//     const res = await handler(req);
//     if (allowOrigin) {
//       res.headers.set("Access-Control-Allow-Origin", allowOrigin);
//       res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//       res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     }
//     return res;
//   };
// }

// export const GET = withCors(authHandler.GET);
// export const POST = withCors(authHandler.POST);

// export async function OPTIONS(req: NextRequest) {
//   const origin = req.headers.get("origin");
//   const allowOrigin = isAllowedOrigin(origin) ? origin : "";
//   return new NextResponse(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": allowOrigin,
//       "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   });
// }
