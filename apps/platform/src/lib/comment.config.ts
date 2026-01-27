import { createBetterAuthAdapter } from "@fuma-comment/server/adapters/better-auth";
import { createDrizzleAdapter } from "@fuma-comment/server/adapters/drizzle";
import { auth as betterAuth } from "~/auth";
import { db } from "~/db/connect";
import { comments, rates, roles, users } from "~/db/schema";

export const storage = createDrizzleAdapter({
    db,
    schemas: {
        comments,
        rates,
        roles,
        user: users,
    },
    // Use tables created by your auth provider
    auth: "better-auth",
});


export const auth = createBetterAuthAdapter(betterAuth);