import { getAllPolls } from '$lib/server/actions/poll';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const polls = await getAllPolls().catch(() => []);
	return { polls, user: locals.user };
};
