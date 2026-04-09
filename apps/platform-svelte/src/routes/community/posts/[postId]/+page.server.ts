import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => ({
	routePath: `/community/posts/${params.postId}`
});
