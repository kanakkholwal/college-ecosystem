import { db } from '$lib/server/db/connect';
import { sessions, users } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const ROLES_ENUMS = {
	ADMIN: 'admin',
	STUDENT: 'student',
	GUARD: 'guard',
	GUEST: 'guest'
} as const;

const GUARD_ROUTE = '/guard';
const STATS_CACHE_TTL_MS = 60_000;

type QuickLink = {
	href: string;
	title: string;
	description: string;
	allowedRoles: string[];
	category: 'general' | 'academic' | 'community';
	isNew?: boolean;
};

const quickLinks: QuickLink[] = [
	{
		href: '/resources',
		title: 'Resources',
		description: 'Explore articles, guides, and past archives.',
		allowedRoles: ['*'],
		category: 'general'
	},
	{
		href: '/benefits',
		title: 'Student Benefits',
		description: 'Exclusive deals via your student ID.',
		allowedRoles: ['*'],
		category: 'general',
		isNew: true
	},
	{
		href: '/results',
		title: 'Academic Results',
		description: 'Performance analytics and semester grades.',
		allowedRoles: ['*'],
		category: 'academic'
	},
	{
		href: '/schedules',
		title: 'Time Tables',
		description: 'Daily class schedules and faculty timings.',
		allowedRoles: ['*'],
		category: 'academic'
	},
	{
		href: '/academic-calendar',
		title: 'Academic Calendar',
		description: 'Yearly schedule of exams and holidays.',
		allowedRoles: ['*'],
		category: 'academic'
	},
	{
		href: '/community',
		title: 'Community',
		description: 'Connect with peers in discussion forums.',
		allowedRoles: ['*'],
		category: 'community'
	},
	{
		href: '/announcements',
		title: 'Announcements',
		description: 'Official news and campus updates.',
		allowedRoles: ['*'],
		category: 'community'
	},
	{
		href: '/polls',
		title: 'Polls',
		description: 'Vote on campus opinions and surveys.',
		allowedRoles: ['*'],
		category: 'community'
	},
	{
		href: '/whisper-room',
		title: 'Whisper Room',
		description: 'Anonymous confessions and thoughts.',
		allowedRoles: [ROLES_ENUMS.STUDENT],
		category: 'community',
		isNew: true
	}
];

const hasRoleAccess = (role: string, allowedRoles: string[]): boolean =>
	allowedRoles.includes('*') || allowedRoles.includes(role);

let cachedStats: { sessionCount: number; userCount: number } | null = null;
let cachedStatsAt = 0;

const getPublicStats = async () => {
	const now = Date.now();

	if (cachedStats && now - cachedStatsAt < STATS_CACHE_TTL_MS) {
		return cachedStats;
	}

	const [sessionResult, userResult] = await Promise.allSettled([
		db
			.select({ count: sql<number>`COUNT(*)` })
			.from(sessions)
			.execute(),
		db
			.select({ count: sql<number>`COUNT(*)` })
			.from(users)
			.execute()
	]);

	if (sessionResult.status === 'rejected') {
		console.error('Failed to load session count for home page stats', sessionResult.reason);
	}

	if (userResult.status === 'rejected') {
		console.error('Failed to load user count for home page stats', userResult.reason);
	}

	cachedStats = {
		sessionCount: sessionResult.status === 'fulfilled' ? (sessionResult.value[0]?.count ?? 0) : 0,
		userCount: userResult.status === 'fulfilled' ? (userResult.value[0]?.count ?? 0) : 0
	};
	cachedStatsAt = now;

	return cachedStats;
};

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	const role = user?.role ?? user?.other_roles?.[0] ?? ROLES_ENUMS.GUEST;
	const isGuard =
		user?.role === ROLES_ENUMS.GUARD || user?.other_roles?.includes(ROLES_ENUMS.GUARD) === true;
	const isAdmin =
		user?.role === ROLES_ENUMS.ADMIN || user?.other_roles?.includes(ROLES_ENUMS.ADMIN) === true;

	if (isGuard && !isAdmin) {
		redirect(303, GUARD_ROUTE);
	}

	const publicStats = await getPublicStats();

	return {
		userName: user?.name ?? null,
		quickLinks: quickLinks.filter((link) => hasRoleAccess(role, link.allowedRoles)),
		publicStats
	};
};
