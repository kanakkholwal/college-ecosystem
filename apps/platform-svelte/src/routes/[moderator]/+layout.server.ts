import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const ALLOWED_MODERATORS = [
	'admin',
	'student',
	'cr',
	'faculty',
	'hod',
	'assistant',
	'mmca',
	'warden',
	'assistant_warden',
	'chief_warden',
	'librarian',
	'staff',
	'guard',
	'dashboard'
] as const;

const isAllowedModerator = (moderator: string): boolean =>
	ALLOWED_MODERATORS.includes(moderator as (typeof ALLOWED_MODERATORS)[number]);

export const load: LayoutServerLoad = async ({ params, url }) => {
	if (!isAllowedModerator(params.moderator)) {
		error(404, 'Route not found');
	}

	return {
		routePath: url.pathname
	};
};
