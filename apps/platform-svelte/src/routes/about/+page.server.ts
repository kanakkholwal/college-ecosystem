import type { PageServerLoad } from './$types';

type Contributor = {
	name: string;
	username: string;
	avatar: string;
	contributions: number;
};

type Stats = {
	visitors: number;
	stars: number;
	forks: number;
	contributors: number;
};

type RepoResponse = {
	stargazers_count?: number;
	forks_count?: number;
};

type GithubContributor = {
	login: string;
	avatar_url: string;
	contributions: number;
};

const FALLBACK_STATS: Stats = {
	visitors: 345221,
	stars: 12,
	forks: 2,
	contributors: 1
};

const FALLBACK_CONTRIBUTORS: Contributor[] = [
	{
		name: 'Kanak Kholwal',
		username: 'kanakkholwal',
		avatar: 'https://github.com/kanakkholwal.png',
		contributions: 1
	}
];

const GITHUB_OWNER = 'kanakkholwal';
const GITHUB_REPO = 'college-ecosystem';

const extractVisitorCount = async (fetchFn: typeof fetch): Promise<number> => {
	try {
		const response = await fetchFn(
			'https://visitor-badge.laobi.icu/badge?page_id=nith_portal.visitor-badge'
		);
		if (!response.ok) return FALLBACK_STATS.visitors;
		const svg = await response.text();
		const matches = svg.match(/<text[^>]*>(\d+)<\/text>/gi);
		if (!matches) return FALLBACK_STATS.visitors;
		for (const match of matches) {
			const count = Number(match.match(/>(\d+)</)?.[1]);
			if (Number.isFinite(count) && count > 0) {
				return count;
			}
		}
		return FALLBACK_STATS.visitors;
	} catch {
		return FALLBACK_STATS.visitors;
	}
};

const getRepoStats = async (fetchFn: typeof fetch): Promise<Stats> => {
	try {
		const response = await fetchFn(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`, {
			headers: { Accept: 'application/vnd.github+json' }
		});
		const visitors = await extractVisitorCount(fetchFn);
		if (!response.ok) return { ...FALLBACK_STATS, visitors };
		const data = (await response.json()) as RepoResponse;
		return {
			visitors,
			stars: data.stargazers_count ?? FALLBACK_STATS.stars,
			forks: data.forks_count ?? FALLBACK_STATS.forks,
			contributors: FALLBACK_STATS.contributors
		};
	} catch {
		return FALLBACK_STATS;
	}
};

const getRepoContributors = async (fetchFn: typeof fetch): Promise<Contributor[]> => {
	try {
		const response = await fetchFn(
			`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contributors`,
			{
				headers: { Accept: 'application/vnd.github+json' }
			}
		);
		if (!response.ok) return FALLBACK_CONTRIBUTORS;
		const data = (await response.json()) as GithubContributor[];
		return data.map((contributor) => ({
			name: contributor.login,
			username: contributor.login,
			avatar: contributor.avatar_url,
			contributions: contributor.contributions
		}));
	} catch {
		return FALLBACK_CONTRIBUTORS;
	}
};

export const load: PageServerLoad = async ({ fetch }) => {
	const [stats, contributors] = await Promise.all([
		getRepoStats(fetch),
		getRepoContributors(fetch)
	]);

	const contributorCount = contributors.length || FALLBACK_STATS.contributors;

	return {
		stats: {
			...stats,
			contributors: contributorCount
		},
		contributors
	};
};
