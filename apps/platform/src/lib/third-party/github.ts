import { createFetch } from "@better-fetch/fetch";
import { appConfig } from "~/project.config";

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

export async function getRepoStarGazers(
  repoUri = appConfig.githubUri
): Promise<number> {
  try {
    if (process.env.NODE_ENV !== "production") {
      return 12; // Fallback value for non-production environments
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
      return Promise.resolve(12); // Fallback value
    }
    return response.data.stargazers_count || 12; // Default to 12 if not available
  } catch (error) {
    console.warn("Error fetching GitHub stars:", error);
    return 12; // Fallback value
  }
}
export async function extractVisitorCount(): Promise<number> {
  const url =
    "https://visitor-badge.laobi.icu/badge?page_id=nith_portal.visitor-badge";

  try {
    const response = await fetch(url);
    const svgText = await response.text();

    // Looks for text elements containing only digits, ignoring attributes
    const digitMatches = svgText.match(/<text[^>]*>(\d+)<\/text>/gi);
    if (digitMatches) {
      // Find the first match that's actually the number (not x/y coordinates etc)
      for (const match of digitMatches) {
        const numberMatch = match.match(/>(\d+)</);
        if (numberMatch && numberMatch[1]) {
          const count = parseInt(numberMatch[1], 10);
          if (!isNaN(count)) return count;
        }
      }
    }

    // Method 3: Alternative regex pattern if the above fails
    const lastResortMatch = svgText.match(/>\s*(\d+)\s*<\/text>/);
    if (lastResortMatch && lastResortMatch[1]) {
      const count = parseInt(lastResortMatch[1], 10);
      if (!isNaN(count)) return count;
    }

    console.warn("Visitor count not found in SVG");
    return 345221; // Default value to last remembered count
  } catch (error) {
    console.error("Error extracting visitor count:", error);
    throw error;
  }
}
export async function getRepoStats(
  repoUri = appConfig.githubUri
): Promise<StatsData> {
  try {
    if (process.env.NODE_ENV !== "production") {
      return { stars: 12, forks: 2, contributors: 1, visitors: 345221 };
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
      return {
        stars: 12,
        forks: 2,
        contributors: 1,
        visitors: await extractVisitorCount(),
      };
    }

    return {
      stars: response.data.stargazers_count || 9,
      forks: response.data.forks_count || 2,
      contributors: response.data.subscribers_count || 1, // Assuming subscribers as contributors
      visitors: await extractVisitorCount(),
    };
  } catch (error) {
    console.error("Caught Error fetching GitHub repository data:", error);
    return Promise.reject(error);
  }
}
export async function getRepoContributors(
  repoUri = appConfig.githubUri
): Promise<
  {
    name: string;
    username: string;
    avatar: string;
    contributions: number;
  }[]
> {
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
