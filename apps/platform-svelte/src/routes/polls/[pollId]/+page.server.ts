import { error, fail } from '@sveltejs/kit';
import { getPollById, voteOnPoll, deletePoll } from '$lib/server/actions/poll';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const poll = await getPollById(params.pollId).catch(() => null);
	if (!poll) error(404, 'Poll not found');
	return { poll, user: locals.user };
};

export const actions: Actions = {
	vote: async ({ params, locals, request }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' });
		const fd = await request.formData();
		const optionId = String(fd.get('optionId') ?? '');
		try {
			await voteOnPoll(params.pollId, optionId, locals.user);
			return { success: true };
		} catch (e) {
			return fail(400, { error: e instanceof Error ? e.message : 'Failed to vote' });
		}
	},
	delete: async ({ params, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Forbidden' });
		}
		try {
			await deletePoll(params.pollId);
			return { success: true };
		} catch (e) {
			return fail(500, { error: e instanceof Error ? e.message : 'Failed' });
		}
	}
};
