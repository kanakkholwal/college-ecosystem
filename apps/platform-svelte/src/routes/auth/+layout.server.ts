import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// If already logged in, redirect away from auth pages (except verify-mail / reset-password)
	const allowIfLoggedIn =
		url.pathname.startsWith('/auth/verify-mail') ||
		url.pathname.startsWith('/auth/reset-password');

	if (locals.user && !allowIfLoggedIn) {
		const next = url.searchParams.get('next') || '/';
		redirect(303, next);
	}

	return {};
};
