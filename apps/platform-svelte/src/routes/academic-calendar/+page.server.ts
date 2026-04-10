import { getEvents } from '$lib/server/actions/events';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const now = new Date();
	const yearStart = new Date(now.getFullYear(), 0, 1);
	const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

	const events = await getEvents({ from: yearStart, to: yearEnd }).catch(() => []);
	return { events };
};
