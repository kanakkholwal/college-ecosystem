import { getAnnouncements } from '$lib/server/actions/announcement';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const announcements = await getAnnouncements().catch(() => []);
	return { announcements, user: locals.user };
};
