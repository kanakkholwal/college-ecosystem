import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => ({
	routePath: `/whisper-room/feed/${params.postId}/edit`
});
