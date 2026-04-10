import { fail, redirect } from '@sveltejs/kit';
import { createPost } from '$lib/server/actions/community';
import { CATEGORY_TYPES } from '$lib/constants/common.community';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(303, `/auth/sign-in?next=${encodeURIComponent(url.pathname)}`);
	}
	return {
		user: locals.user,
		defaultCategory: url.searchParams.get('c') || 'general'
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const title = String(formData.get('title') ?? '').trim();
		const content = String(formData.get('content') ?? '').trim();
		const category = String(formData.get('category') ?? 'general').trim();

		if (title.length < 3) return fail(400, { error: 'Title must be at least 3 characters', title, content, category });
		if (content.length < 10)
			return fail(400, { error: 'Content must be at least 10 characters', title, content, category });

		try {
			await createPost(
				{
					title,
					content,
					category,
					subCategory: 'general',
					tags: []
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any,
				locals.user
			);
		} catch (e) {
			console.error(e);
			return fail(500, {
				error: e instanceof Error ? e.message : 'Failed to create post',
				title,
				content,
				category
			});
		}

		redirect(303, '/community');
	}
};

export const _categories = CATEGORY_TYPES;
