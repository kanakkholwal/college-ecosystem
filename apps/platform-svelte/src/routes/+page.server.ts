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
		href: '/syllabus',
		title: 'Syllabus',
		description: 'Curriculum tracking and course structures.',
		allowedRoles: ['*'],
		category: 'academic'
	},
	{
		href: '/classroom-availability',
		title: 'Classroom Finder',
		description: 'Live occupancy status of lecture halls.',
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
let inFlightStatsPromise: Promise<{ sessionCount: number; userCount: number }> | null = null;

const parseCount = (value: unknown): number => {
	if (typeof value === 'number') return value;
	if (typeof value === 'string') {
		const parsed = Number.parseInt(value, 10);
		return Number.isNaN(parsed) ? 0 : parsed;
	}
	return 0;
};

const getTableCount = async (
	table: typeof sessions | typeof users,
	label: 'session' | 'user'
): Promise<number> => {
	try {
		const result = await db
			.select({ count: sql<string>`COUNT(*)` })
			.from(table)
			.execute();
		return parseCount(result[0]?.count);
	} catch (countError) {
		console.error(`Failed to load ${label} count for home page stats`, countError);
		return 0;
	}
};

const getPublicStats = async () => {
	const now = Date.now();

	if (cachedStats && now - cachedStatsAt < STATS_CACHE_TTL_MS) {
		return cachedStats;
	}

	if (inFlightStatsPromise) {
		return inFlightStatsPromise;
	}

	inFlightStatsPromise = (async () => {
		const [sessionCount, userCount] = await Promise.all([
			getTableCount(sessions, 'session'),
			getTableCount(users, 'user')
		]);

		cachedStats = { sessionCount, userCount };
		cachedStatsAt = Date.now();

		return cachedStats;
	})().finally(() => {
		inFlightStatsPromise = null;
	});

	return inFlightStatsPromise;
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
