import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => ({
	routePath: `/resources/${params.type}/${params.slug}`
});
