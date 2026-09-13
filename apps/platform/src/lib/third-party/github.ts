import { createFetch } from "@better-fetch/fetch";
import { cache } from "react";
import { appConfig } from "~/project.config";

/** Shown when GitHub or the visitor-badge service is unreachable or rate limited. */
export const FALLBACK_STATS = {
  stars: 34,
  forks: 12,
  contributors: 1,
  visitors: 1_800_000,
} as const;

export const githubApiFetch = createFetch({
  baseURL: "https://api.github.com",
  headers: process.env.GITHUB_OAUTH_TOKEN
    ? {
        Authorization: `Bearer ${process.env.GITHUB_OAUTH_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      }
    : {
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
  next: {
    revalidate: 3600,
  },
});

export const getRepoStarGazers = cache(
  async (repoUri = appConfig.githubUri): Promise<number> => {
    try {
      if (process.env.NODE_ENV !== "production") return FALLBACK_STATS.stars;
      const response = await githubApiFetch<RepoData>(`/repos/${repoUri}`);
      if (response.error) {
        if (
          !(
            response.error.status === 403 ||
            response.error.statusText === "rate limit exceeded"
          )
        ) {
          return Promise.reject(response.error);
        }
        console.warn("GitHub API rate limit exceeded. Returning cached stats.");
        return FALLBACK_STATS.stars;
      }
      return response.data.stargazers_count || FALLBACK_STATS.stars;
    } catch (error) {
      console.warn("Error fetching GitHub stars:", error);
      return FALLBACK_STATS.stars;
    }
  }
);
export const VISITOR_BADGE_URL =
  "https://visitor-badge.laobi.icu/badge?page_id=nith_portal.visitor-badge";

/** Reads the counter out of the badge SVG, or null if its markup changed. */
export function parseVisitorCount(svg: string): number | null {
  const match = svg.match(/<text[^>]*>\s*(\d+)\s*<\/text>/i);
  if (!match) return null;
  const count = Number.parseInt(match[1], 10);
  return Number.isNaN(count) ? null : count;
}

/** Every request to the badge adds one to the counter, so this both records a view and returns the new total. */
export async function recordImpression(): Promise<number> {
  try {
    const response = await fetch(VISITOR_BADGE_URL, { cache: "no-store" });
    return parseVisitorCount(await response.text()) ?? FALLBACK_STATS.visitors;
  } catch (error) {
    console.error("Error recording impression:", error);
    return FALLBACK_STATS.visitors;
  }
}

// Server-side reads also count as hits, so this revalidates hourly to add at most one per hour.
export const extractVisitorCount = cache(async (): Promise<number> => {
  try {
    const response = await fetch(VISITOR_BADGE_URL, {
      next: { revalidate: 3600 },
    });
    return parseVisitorCount(await response.text()) ?? FALLBACK_STATS.visitors;
  } catch (error) {
    console.error("Error extracting visitor count:", error);
    return FALLBACK_STATS.visitors;
  }
});
export const getRepoStats = cache(
  async (repoUri = appConfig.githubUri): Promise<StatsData> => {
    try {
      if (process.env.NODE_ENV !== "production") {
        return { ...FALLBACK_STATS };
      }
      const response = await githubApiFetch<RepoData>(`/repos/${repoUri}`);
      if (response.error) {
        if (
          !(
            response.error.status === 403 ||
            response.error.statusText === "rate limit exceeded"
          )
        ) {
          return Promise.reject(response.error);
        }
        console.warn("GitHub API rate limit exceeded. Returning cached stats.");
        return { ...FALLBACK_STATS, visitors: await extractVisitorCount() };
      }

      return {
        stars: response.data.stargazers_count || FALLBACK_STATS.stars,
        forks: response.data.forks_count || FALLBACK_STATS.forks,
        contributors:
          response.data.subscribers_count || FALLBACK_STATS.contributors,
        visitors: await extractVisitorCount(),
      };
    } catch (error) {
      console.error("Caught Error fetching GitHub repository data:", error);
      return Promise.reject(error);
    }
  }
);
export const getRepoContributors = cache(
  async (
    repoUri = appConfig.githubUri
  ): Promise<
    {
      name: string;
      username: string;
      avatar: string;
      contributions: number;
    }[]
  > => {
    try {
      const response = await githubApiFetch<Contributor[]>(
        `/repos/${repoUri}/contributors`
      );
      if (response.error) {
        return Promise.reject(response.error);
      }
      return response.data.map((contributor) => ({
        name: contributor.login,
        username: contributor.login,
        avatar: contributor.avatar_url,
        contributions: contributor.contributions,
      }));
    } catch (error) {
      console.error("Error fetching GitHub contributors:", error);
      return Promise.reject(error);
    }
  }
);

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
};

export interface RepoData {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: Owner;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  mirror_url: any;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: License;
  allow_forking: boolean;
  is_template: boolean;
  web_commit_signoff_required: boolean;
  topics: string[];
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  temp_clone_token: any;
  network_count: number;
  subscribers_count: number;
}

export interface Owner {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
}

export interface License {
  key: string;
  name: string;
  spdx_id: string;
  url: string;
  node_id: string;
}

export interface Contributor {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
  contributions: number;
}
