import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from '$lib/server/db/connect';
import { accounts, sessions, users, verifications } from '$lib/server/db/schema';

const baseURL = env.BETTER_AUTH_URL ?? 'http://localhost:5173';

export const betterAuthOptions = {
	appName: 'NITH Platform',
	baseURL,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			users,
			sessions,
			accounts,
			verifications
		},
		usePlural: true
	}),
	emailAndPassword: {
		enabled: true
	},
	trustedOrigins: dev ? ['http://localhost:5173'] : [baseURL],
	plugins: [sveltekitCookies(getRequestEvent)],
	telemetry: {
		enabled: false
	}
} satisfies BetterAuthOptions;

export const auth = betterAuth(betterAuthOptions);

export type Session = typeof auth.$Infer.Session;
export type SessionUser = typeof auth.$Infer.Session.user;
