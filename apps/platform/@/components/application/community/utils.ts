import { ROLES_ENUMS } from "~/constants";
import { CATEGORIES } from "~/constants/common.community";

export type CommunityCategory = (typeof CATEGORIES)[number];
export type FeedSort = "recent" | "popular";

export const FEED_SORTS: { value: FeedSort; label: string }[] = [
  { value: "recent", label: "Latest" },
  { value: "popular", label: "Most viewed" },
];

export function getCategory(value?: string | null) {
  return CATEGORIES.find((c) => c.value === value);
}

export function parseSort(value?: string | null): FeedSort {
  return value === "popular" ? "popular" : "recent";
}

/** Fuma comment thread id for a post; must match what the detail page passes to `CommentSection`. */
export function commentsPageId(postId: string) {
  return `community.posts.${postId}`;
}

export function feedHref({
  category,
  sort,
  page,
}: {
  category?: string;
  sort?: FeedSort;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("c", category);
  if (sort && sort !== "recent") params.set("sort", sort);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/community?${query}` : "/community";
}

export function signInHref(next: string) {
  return `/auth/sign-in?next=${encodeURIComponent(next)}`;
}

type Viewer = { id: string; role?: string | null } | null | undefined;

/** Authors manage their own posts; admins manage every post. Mirrors the checks in `updatePost` and `deletePost`. */
export function canManagePost(
  viewer: Viewer,
  post: { author: { id: string } }
) {
  return (
    !!viewer &&
    (viewer.id === post.author.id || viewer.role === ROLES_ENUMS.ADMIN)
  );
}

const MARKDOWN_NOISE: [RegExp, string][] = [
  [/```[\s\S]*?```/g, " "],
  [/`([^`]*)`/g, "$1"],
  [/!\[[^\]]*\]\([^)]*\)/g, " "],
  [/\[([^\]]*)\]\([^)]*\)/g, "$1"],
  [/<[^>]+>/g, " "],
  [/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, ""],
  [/(\*\*|~~|\*)(\S[\s\S]*?\S|\S)\1/g, "$2"],
  [/(?<!\w)(__|_)(\S[\s\S]*?\S|\S)\1(?!\w)/g, "$2"],
  [/\s+/g, " "],
];

/** Plain-text preview of a markdown body, so the feed ships no markdown renderer. */
export function toExcerpt(markdown: string, max = 240) {
  let text = markdown ?? "";
  for (const [pattern, replacement] of MARKDOWN_NOISE) {
    text = text.replace(pattern, replacement);
  }
  text = text.trim();
  if (text.length <= max) return { text, truncated: false };
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return {
    text: `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`,
    truncated: true,
  };
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? [parts[0][0], parts.at(-1)?.[0]] : [parts[0]?.[0]];
  return letters.join("").toUpperCase() || "?";
}
