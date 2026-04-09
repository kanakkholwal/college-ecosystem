import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => ({
	routePath: `/schedules/${params.slug}`
});
