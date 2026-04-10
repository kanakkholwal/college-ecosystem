import { error } from '@sveltejs/kit';
import { getCourseByCode } from '$lib/server/actions/course';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const data = await getCourseByCode(params.code);
	if (!data.course) error(404, 'Course not found');
	return data;
};
