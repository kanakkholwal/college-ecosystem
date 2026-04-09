import type { auth } from '$lib/server/auth';
import {
	adminClient,
	inferAdditionalFields,
	usernameClient
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
import { getBaseURL } from './env/url';

export const authClient = createAuthClient({
	baseURL: getBaseURL(),
	plugins: [usernameClient(), adminClient(), inferAdditionalFields<typeof auth>()]
});

export const { signIn, signUp, useSession, signOut } = authClient;

export type Session = typeof authClient.$Infer.Session;
