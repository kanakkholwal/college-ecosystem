import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const DASHBOARD_ROLE_PREFIXES = [
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

const DASHBOARD_PREFIX_REGEX = new RegExp(`^/(${DASHBOARD_ROLE_PREFIXES.join('|')})(?:/.*)?$`);

const PARITY_ROUTE_PATTERNS: RegExp[] = [DASHBOARD_PREFIX_REGEX];

const isKnownParityRoute = (path: string): boolean =>
	PARITY_ROUTE_PATTERNS.some((pattern) => pattern.test(path));

export const load: PageServerLoad = async ({ params }) => {
	const routePath = `/${params.path}`;

	if (!isKnownParityRoute(routePath)) {
		error(404, 'Route not found');
	}

	return {
		routePath
	};
};
