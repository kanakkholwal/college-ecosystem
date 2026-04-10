import { getCachedLabels, getResults } from '$lib/server/actions/result';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('query') ?? '';
	const page = Number(url.searchParams.get('page') ?? '1') || 1;
	const batch = url.searchParams.get('batch') ?? 'all';
	const branch = url.searchParams.get('branch') ?? 'all';
	const programme = url.searchParams.get('programme') ?? 'all';
	const cache = url.searchParams.get('cache');
	const freshers = url.searchParams.get('freshers');
	const newCache = cache === 'new';

	const labels = await getCachedLabels(newCache);

	const filter = {
		batch,
		branch: branch === 'all' ? '' : branch,
		programme: programme === 'all' ? '' : programme,
		include_freshers: freshers === '1'
	};

	const resultsData = await getResults(query, page, filter, newCache).catch((err) => {
		console.error('Failed to load results:', err);
		return { results: [], totalPages: 1, totalCount: 0 };
	});

	return {
		query,
		page,
		batch,
		branch,
		programme,
		freshers: freshers === '1',
		labels,
		resultsData,
		session: 'Fall 2025'
	};
};
