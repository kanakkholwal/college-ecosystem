import { error, fail } from '@sveltejs/kit';
import { getPostById, updatePost, deletePost } from '$lib/server/actions/community';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const post = await getPostById(params.postId, false).catch(() => null);
	if (!post) error(404, 'Post not found');

	return { post, user: locals.user };
};

export const actions: Actions = {
	toggleLike: async ({ params, locals }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' });
		try {
			await updatePost(params.postId, { type: 'toggleLike' }, locals.user);
			return { success: true };
		} catch (e) {
			return fail(500, { error: e instanceof Error ? e.message : 'Failed' });
		}
	},
	toggleSave: async ({ params, locals }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' });
		try {
			await updatePost(params.postId, { type: 'toggleSave' }, locals.user);
			return { success: true };
		} catch (e) {
			return fail(500, { error: e instanceof Error ? e.message : 'Failed' });
		}
	},
	delete: async ({ params, locals }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' });
		try {
			await deletePost(params.postId, locals.user);
			return { success: true, deleted: true };
		} catch (e) {
			return fail(500, { error: e instanceof Error ? e.message : 'Failed to delete' });
		}
	}
};
