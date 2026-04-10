import { getAllTimeTables } from '$lib/server/actions/time-table';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const timeTables = await getAllTimeTables().catch((err) => {
		console.error(err);
		return [];
	});

	const years = Array.from(new Set(timeTables.map((t) => t.year?.toString() || ''))).filter(Boolean);
	const branches = Array.from(
		new Set(timeTables.map((t) => t.department_code || ''))
	).filter(Boolean);

	return { timeTables, years, branches };
};
