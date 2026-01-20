import { createDrizzleAdapter } from "@fuma-comment/server/adapters/drizzle";
import { db } from "~/db/connect";
import { comments, rates, roles, users } from "~/db/schema";
import { createBetterAuthAdapter } from "@fuma-comment/server/adapters/better-auth";
import { auth as betterAuth } from "~/auth";

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