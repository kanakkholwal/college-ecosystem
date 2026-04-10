import { getPostsByCategory } from '$lib/server/actions/community';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const category = url.searchParams.get('c') || 'all';
	const page = Number(url.searchParams.get('page') ?? '1') || 1;
	const limit = Number(url.searchParams.get('limit') ?? '10') || 10;

	const posts = await getPostsByCategory(category, page, limit).catch((err) => {
		console.error('Failed to load posts:', err);
		return [];
	});

	return {
		posts,
		category,
		user: locals.user
	};
};
