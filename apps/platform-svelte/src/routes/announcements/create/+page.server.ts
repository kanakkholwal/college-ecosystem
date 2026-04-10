import { fail, redirect } from '@sveltejs/kit';
import { createAnnouncement } from '$lib/server/actions/announcement';
import { RELATED_FOR_TYPES } from '$lib/constants/common.announcement';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(303, `/auth/sign-in?next=${encodeURIComponent(url.pathname)}`);
	}
	if (locals.user.role !== 'admin' && !locals.user.other_roles.includes('faculty')) {
		redirect(303, '/unauthorized');
	}
	return { relatedForTypes: RELATED_FOR_TYPES };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Unauthorized' });

		const fd = await request.formData();
		const title = String(fd.get('title') ?? '').trim();
		const description = String(fd.get('description') ?? '').trim();
		const relatedFor = String(fd.get('relatedFor') ?? 'academics').trim();

		if (title.length < 3) return fail(400, { error: 'Title too short', title, description, relatedFor });
		if (description.length < 10)
			return fail(400, { error: 'Description too short', title, description, relatedFor });

		try {
			await createAnnouncement(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				{ title, description, relatedFor } as any,
				locals.user
			);
		} catch (e) {
			return fail(500, {
				error: e instanceof Error ? e.message : 'Failed',
				title,
				description,
				relatedFor
			});
		}
		redirect(303, '/announcements');
	}
};
