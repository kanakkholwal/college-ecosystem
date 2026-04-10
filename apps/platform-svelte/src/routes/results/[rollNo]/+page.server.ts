import { error } from '@sveltejs/kit';
import { getResultByRollNo } from '$lib/server/actions/result';
import { isValidRollNumber } from '$constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const { rollNo } = params;

	if (!isValidRollNumber(rollNo)) {
		error(400, 'Invalid roll number format');
	}

	const isNew = url.searchParams.get('new') === '1';
	const update = url.searchParams.get('update') === '1';

	const result = await getResultByRollNo(rollNo, update, isNew);

	if (!result) {
		error(404, `Result not found for ${rollNo}`);
	}

	return { result, rollNo };
};
