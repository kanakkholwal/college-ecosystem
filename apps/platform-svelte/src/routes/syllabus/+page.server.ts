import { getCourses } from '$lib/server/actions/course';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('query') ?? '';
	const page = Number(url.searchParams.get('page') ?? '1') || 1;
	const department = url.searchParams.get('department') ?? 'all';
	const type = url.searchParams.get('type') ?? 'all';

	const data = await getCourses(query, page, { department, type }).catch(() => ({
		courses: [],
		totalPages: 1,
		departments: [],
		types: []
	}));

	return { ...data, query, page, department, type };
};
