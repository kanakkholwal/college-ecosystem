import { error } from '@sveltejs/kit';
import { getUserByUsername, getUserPlatformActivities } from '$lib/server/actions/user';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const user = await getUserByUsername(params.username);
	if (!user) error(404, 'User not found');

	const activities = await getUserPlatformActivities(user.id, user.username);
	return { profile: user, activities };
};
