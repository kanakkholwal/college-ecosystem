import { error } from '@sveltejs/kit';
import { getTimeTable } from '$lib/server/actions/time-table';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const parts = params.slug.split('/').filter(Boolean);
	if (parts.length < 3) error(400, 'Invalid schedule path. Expected /{department}/{year}/{semester}');

	const [department_code, yearStr, semesterStr] = parts;
	const year = Number(yearStr);
	const semester = Number(semesterStr);

	if (Number.isNaN(year) || Number.isNaN(semester)) {
		error(400, 'Year and semester must be numbers');
	}

	const timetable = await getTimeTable(department_code, year, semester).catch(() => null);
	if (!timetable) error(404, 'Timetable not found');

	return { timetable };
};
