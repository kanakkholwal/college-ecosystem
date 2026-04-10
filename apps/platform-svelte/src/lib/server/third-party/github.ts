import { createFetch } from '@better-fetch/fetch';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { appConfig } from '$lib/config/project';

export const githubApiFetch = createFetch({
	baseURL: 'https://api.github.com',
	headers: env.GITHUB_OAUTH_TOKEN
		? {
				Authorization: `Bearer ${env.GITHUB_OAUTH_TOKEN}`,
				'Content-Type': 'application/json',
				Accept: 'application/vnd.github+json'
			}
		: {
				'Content-Type': 'application/json',
				Accept: 'application/vnd.github+json'
			}
});

export async function getRepoStarGazers(repoUri = appConfig.githubUri): Promise<number> {
	try {
		if (dev) return 12;
		const response = await githubApiFetch<RepoData>(`/repos/${repoUri}`);
		if (response.error) {
			if (response.error.status !== 403) return Promise.reject(response.error);
			console.warn('GitHub API rate limit exceeded. Returning cached stats.');
			return 12;
		}
		return response.data?.stargazers_count || 12;
	} catch (error) {
		console.warn('Error fetching GitHub stars:', error);
		return 12;
	}
}

export async function extractVisitorCount(): Promise<number> {
	const url = 'https://visitor-badge.laobi.icu/badge?page_id=nith_portal.visitor-badge';

	try {
		const response = await fetch(url);
		const svgText = await response.text();

		const digitMatches = svgText.match(/<text[^>]*>(\d+)<\/text>/gi);
		if (digitMatches) {
			for (const match of digitMatches) {
				const numberMatch = match.match(/>(\d+)</);
				if (numberMatch && numberMatch[1]) {
					const count = parseInt(numberMatch[1], 10);
					if (!isNaN(count)) return count;
				}
			}
		}
		const lastResortMatch = svgText.match(/>\s*(\d+)\s*<\/text>/);
		if (lastResortMatch && lastResortMatch[1]) {
			const count = parseInt(lastResortMatch[1], 10);
			if (!isNaN(count)) return count;
		}

		console.warn('Visitor count not found in SVG');
		return 1_000_000;
	} catch (error) {
		console.error('Error extracting visitor count:', error);
		return 1_000_000;
	}
}

export async function getRepoStats(repoUri = appConfig.githubUri): Promise<StatsData> {
	try {
		if (dev) return { stars: 12, forks: 2, contributors: 1, visitors: 345221 };

		const response = await githubApiFetch<RepoData>(`/repos/${repoUri}`);
		if (response.error) {
			if (response.error.status !== 403) return Promise.reject(response.error);
			console.warn('GitHub API rate limit exceeded. Returning cached stats.');
			return {
				stars: 12,
				forks: 2,
				contributors: 1,
				visitors: await extractVisitorCount()
			};
		}

		return {
			stars: response.data?.stargazers_count || 9,
			forks: response.data?.forks_count || 2,
			contributors: response.data?.subscribers_count || 1,
			visitors: await extractVisitorCount()
		};
	} catch (error) {
		console.error('Caught Error fetching GitHub repository data:', error);
		return { stars: 12, forks: 2, contributors: 1, visitors: 0 };
	}
}

export type StatsData = {
	stars: number;
	forks: number;
	contributors: number;
	visitors: number;
};

export type PublicStatsType = {
	sessionCount: number;
	userCount: number;
	githubStats: StatsData;
	visitors: number;
};

export interface RepoData {
	stargazers_count: number;
	forks_count: number;
	subscribers_count: number;
	[key: string]: unknown;
}
