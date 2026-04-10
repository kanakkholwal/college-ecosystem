import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => ({
	routePath: `/resources/stories/${params.id}`
});
