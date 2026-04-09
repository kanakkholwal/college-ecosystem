import {
	adminClient,
	inferAdditionalFields,
	usernameClient
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
import type { auth } from '$lib/server/auth';

export const authClient = createAuthClient({
	baseURL: window.location.origin,
	plugins: [usernameClient(), adminClient(), inferAdditionalFields<typeof auth>()]
});

export const { signIn, signUp, useSession, signOut } = authClient;

export type Session = typeof authClient.$Infer.Session;
