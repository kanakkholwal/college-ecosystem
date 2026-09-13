import { CATEGORY_LABELS } from "@/components/application/announcements/labels";
import {
  PostCard,
  PostCardSkeleton,
  RelativeTime,
} from "@/components/application/community/post-card";
import { toExcerpt } from "@/components/application/community/utils";
import {
  PollCard,
  PollCardSkeleton,
} from "@/components/application/poll/poll-card";
import { canManagePoll, toPollView } from "@/components/application/poll/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Megaphone,
  MessageSquareText,
  Vote,
} from "lucide-react";
import Link from "next/link";
import type { Session } from "~/auth";
import { getCommentCounts } from "../../../../(community)/community/data";
import {
  getUserAnnouncements,
  getUserPolls,
  getUserPosts,
  PAGE_SIZE,
  PROFILE_TABS,
  type Profile,
  type ProfileTab,
} from "../data";

type Counts = Record<ProfileTab, number | null>;

const tabHref = (username: string, tab: ProfileTab, page = 1) => {
  const params = new URLSearchParams();
  if (tab !== "posts") params.set("tab", tab);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/u/${username}${query ? `?${query}` : ""}`;
};

const TAB_ICONS = {
  posts: MessageSquareText,
  polls: Vote,
  announcements: Megaphone,
} as const;

export function ProfileTabs({
  username,
  active,
  counts,
}: {
  username: string;
  active: ProfileTab;
  counts?: Counts;
}) {
  // Most people never post an announcement; hide the tab unless there is one.
  const tabs = PROFILE_TABS.filter(
    (t) =>
      t.value !== "announcements" ||
      active === "announcements" ||
      (counts?.announcements ?? 0) > 0
  );
  return (
    <nav
      aria-label="Profile activity"
      className="inline-flex h-10 max-w-full items-center overflow-x-auto rounded-lg border border-border bg-card p-0.5 dark:bg-background"
    >
      {tabs.map((tab) => {
        const current = tab.value === active;
        const Icon = TAB_ICONS[tab.value];
        const count = counts?.[tab.value];
        return (
          <Link
            key={tab.value}
            href={tabHref(username, tab.value)}
            aria-current={current ? "page" : undefined}
            className={cn(
              "inline-flex h-full shrink-0 items-center gap-1.5 rounded-md px-3 text-body outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
              current
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {tab.label}
            {typeof count === "number" && (
              <span className="text-caption tabular-nums text-muted-foreground">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export async function ActivityList({
  profile,
  tab,
  page,
  viewer,
  counts,
}: {
  profile: Profile;
  tab: ProfileTab;
  page: number;
  viewer: Session["user"] | undefined;
  counts: Promise<Counts>;
}) {
  const first = profile.name.split(" ")[0];
  const totalPromise = counts.then((c) => c[tab]);

  if (tab === "posts") {
    const [posts, total] = await Promise.all([
      getUserPosts(profile.id, page),
      totalPromise,
    ]);
    if (posts.length === 0) {
      return (
        <EmptyState
          icon={MessageSquareText}
          title={page > 1 ? "No more posts" : "No posts yet"}
          description={`Community posts by ${first} show up here.`}
          action={{ href: "/community", label: "Browse community" }}
        />
      );
    }
    const commentCounts = await getCommentCounts(posts.map((p) => p._id));
    return (
      <>
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post._id}>
              <PostCard
                post={post}
                viewer={viewer}
                commentCount={commentCounts[post._id]}
              />
            </li>
          ))}
        </ul>
        <Pager profile={profile} tab={tab} page={page} total={total} />
      </>
    );
  }

  if (tab === "polls") {
    const [polls, total] = await Promise.all([
      getUserPolls(profile.username, page),
      totalPromise,
    ]);
    if (polls.length === 0) {
      return (
        <EmptyState
          icon={Vote}
          title={page > 1 ? "No more polls" : "No polls yet"}
          description="Closed polls are removed a week after they end."
          action={{ href: "/polls", label: "See open polls" }}
        />
      );
    }
    const now = Date.now();
    return (
      <>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {polls.map((poll) => (
            <li key={String(poll._id)}>
              <PollCard
                poll={toPollView(poll, viewer?.id)}
                now={now}
                signedIn={!!viewer}
                canManage={canManagePoll(viewer, poll.createdBy)}
              />
            </li>
          ))}
        </ul>
        <Pager profile={profile} tab={tab} page={page} total={total} />
      </>
    );
  }

  const [announcements, total] = await Promise.all([
    getUserAnnouncements(profile.id, page),
    totalPromise,
  ]);
  if (announcements.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title={page > 1 ? "No more announcements" : "No live announcements"}
        description="Announcements come down on the date their author set."
        action={{ href: "/announcements", label: "All announcements" }}
      />
    );
  }
  return (
    <>
      <ul className="flex flex-col gap-3">
        {announcements.map((a) => {
          const excerpt = toExcerpt(a.content, 200);
          return (
            <li key={a._id}>
              <article className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:p-5 dark:bg-background">
                <p className="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
                  <span className="inline-flex h-6 items-center rounded-full border border-border px-2 font-medium text-foreground">
                    {CATEGORY_LABELS[
                      a.relatedFor as keyof typeof CATEGORY_LABELS
                    ] ?? a.relatedFor}
                  </span>
                  <RelativeTime date={a.createdAt} />
                </p>
                <h3 className="text-pretty text-body-lg font-medium text-foreground">
                  {a.title}
                </h3>
                {excerpt.text && (
                  <p className="line-clamp-3 text-pretty text-body wrap-break-word text-muted-foreground">
                    {excerpt.text}
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ul>
      <Pager profile={profile} tab={tab} page={page} total={total} />
    </>
  );
}

function Pager({
  profile,
  tab,
  page,
  total,
}: {
  profile: Profile;
  tab: ProfileTab;
  page: number;
  total: number | null;
}) {
  const pages = total === null ? null : Math.ceil(total / PAGE_SIZE[tab]);
  const hasNext = pages === null ? false : page < pages;
  if (page === 1 && !hasNext) return null;
  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-between gap-3"
    >
      {page > 1 ? (
        <ButtonLink
          href={tabHref(profile.username, tab, page - 1)}
          variant="outline"
          size="sm"
        >
          <ChevronLeft />
          Newer
        </ButtonLink>
      ) : (
        <span />
      )}
      {pages !== null && (
        <p className="text-caption tabular-nums text-muted-foreground">
          Page {page} of {pages}
        </p>
      )}
      {hasNext ? (
        <ButtonLink
          href={tabHref(profile.username, tab, page + 1)}
          variant="outline"
          size="sm"
        >
          Older
          <ChevronRight />
        </ButtonLink>
      ) : (
        <span />
      )}
    </nav>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Vote;
  title: string;
  description: string;
  action: { href: string; label: string };
}) {
  return (
    <div className="flex w-full flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground dark:bg-background">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-body-lg font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-body text-muted-foreground">
        {description}
      </p>
      <ButtonLink
        href={action.href}
        variant="outline"
        size="sm"
        className="mt-5"
      >
        {action.label}
      </ButtonLink>
    </div>
  );
}

export function ActivitySkeleton({ tab }: { tab: ProfileTab }) {
  if (tab === "polls") {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <PollCardSkeleton key={`poll-skeleton-${i.toString()}`} />
        ))}
      </div>
    );
  }
  if (tab === "announcements") {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={`announcement-skeleton-${i.toString()}`}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:p-5 dark:bg-background"
          >
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, i) => (
        <PostCardSkeleton key={`post-skeleton-${i.toString()}`} />
      ))}
    </div>
  );
}
