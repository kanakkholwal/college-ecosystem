import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const handleAuth: Handle = async ({ event, resolve }) =>
	svelteKitHandler({
		auth,
		event,
		resolve,
		building
	});

const handleSession: Handle = async ({ event, resolve }) => {
	const currentSession = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.user = currentSession?.user ?? null;
	event.locals.session = currentSession?.session ?? null;

	return resolve(event);
};

export const handle = sequence(handleAuth, handleSession);
