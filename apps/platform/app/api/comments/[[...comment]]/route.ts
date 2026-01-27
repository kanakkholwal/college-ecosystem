import { createBetterAuthAdapter } from "@fuma-comment/server/adapters/better-auth";
import { createDrizzleAdapter } from "@fuma-comment/server/adapters/drizzle";
import { NextComment } from "@fuma-comment/server/next";
import { auth as betterAuth } from "~/auth";
import { db } from "~/db/connect";
import { comments, rates, roles, users } from "~/db/schema";

import type { NextRequest } from "next/server";

// @ts-ignore
const CommentAPI = NextComment({
    mention: { enabled: true },
    auth: createBetterAuthAdapter(betterAuth),
    storage: createDrizzleAdapter({
        auth: "better-auth",
        db,
        schemas: {
            comments,
            rates,
            roles,
            user: users,
        },
    }),
});

// Type wrapper for optional catch-all route params
type OptionalCatchAllContext = { params: Promise<{ comment?: string[] }> };

export const GET = (req: NextRequest, ctx: OptionalCatchAllContext) =>
    CommentAPI.GET(req, ctx as Parameters<typeof CommentAPI.GET>[1]);
export const DELETE = (req: NextRequest, ctx: OptionalCatchAllContext) =>
    CommentAPI.DELETE(req, ctx as Parameters<typeof CommentAPI.DELETE>[1]);
export const PATCH = (req: NextRequest, ctx: OptionalCatchAllContext) =>
    CommentAPI.PATCH(req, ctx as Parameters<typeof CommentAPI.PATCH>[1]);
export const POST = (req: NextRequest, ctx: OptionalCatchAllContext) =>
    CommentAPI.POST(req, ctx as Parameters<typeof CommentAPI.POST>[1]);
