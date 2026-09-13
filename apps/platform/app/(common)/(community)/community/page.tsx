import {
  CategoryChips,
  CategoryList,
  SortTabs,
} from "@/components/application/community/feed-nav";
import { PostCardSkeleton } from "@/components/application/community/post-card";
import {
  type FeedSort,
  feedHref,
  getCategory,
  parseSort,
} from "@/components/application/community/utils";
import AdUnit from "@/components/common/adsense";
import { SignalTower } from "@/components/illustrations/signal-tower";
import { TiltedChip } from "@/components/site/sections";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquareText,
  PenLine,
  TriangleAlert,
} from "lucide-react";
import type { Metadata } from "next";
import { getPostsByCategory } from "~/actions/common.community";
import { getSession } from "~/auth/server";
import { orgConfig } from "~/project.config";
import { getCommentCounts } from "./data";
import CommunityPostList from "./list";

export const metadata: Metadata = {
  title: "Community Feed",
  description: "Questions, notes and discussions from students on campus.",
  alternates: {
    canonical: "/community",
  },
};

const PAGE_SIZE = 10;

type SearchParams = Promise<{ c?: string; page?: string; sort?: string }>;

export default async function CommunitiesPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const category = getCategory(searchParams.c)?.value ?? "all";
  const sort = parseSort(searchParams.sort);
  const page = Math.max(1, Math.floor(Number(searchParams.page)) || 1);
  const active = getCategory(category);

  return (
    <>
      <header className="grid grid-cols-1 items-center gap-8 border-b border-border py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="flex flex-col items-start">
          <TiltedChip>{orgConfig.shortName} community</TiltedChip>
          <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
            Ask, share and
            <br />
            <span className="text-primary">talk it through</span>
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">
            Questions, notes and ideas from students on campus. Pick a community
            or start a thread of your own.
          </p>
          <ButtonLink
            href={`/community/create${active ? `?c=${active.value}` : ""}`}
            variant="primary"
            className="mt-6"
          >
            <PenLine />
            New post
          </ButtonLink>
        </div>
        <SignalTower className="hidden lg:block" />
      </header>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[minmax(0,1fr)_19rem]">
        <section aria-labelledby="feed-heading" className="min-w-0">
          <div className="flex flex-col gap-4">
            <CategoryChips category={category} sort={sort} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2
                id="feed-heading"
                className="text-body-lg font-medium text-foreground"
              >
                {active ? active.name : "All posts"}
              </h2>
              <SortTabs category={category} sort={sort} />
            </div>
          </div>

          <div className="mt-4">
            <ErrorBoundaryWithSuspense
              key={`${category}-${sort}-${page}`}
              fallback={
                <EmptyState
                  icon={<TriangleAlert className="size-6" aria-hidden="true" />}
                  title="Posts couldn't load"
                  description="The community service didn't respond. Refresh the page, or try again in a minute."
                />
              }
              loadingFallback={<FeedSkeleton />}
            >
              <Feed category={category} sort={sort} page={page} />
            </ErrorBoundaryWithSuspense>
          </div>
        </section>

        <aside aria-label="About the community" className="hidden lg:block">
          <div className="sticky top-6 flex flex-col gap-3">
            <div className="rounded-2xl border border-border bg-card p-3 dark:bg-background">
              <h2 className="px-2 pt-1 pb-2 text-caption font-medium text-muted-foreground">
                Communities
              </h2>
              <CategoryList category={category} sort={sort} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 dark:bg-background">
              <h2 className="text-body font-medium text-foreground">
                Before you post
              </h2>
              <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-4 text-body text-muted-foreground marker:text-primary">
                <li>Be respectful and civil.</li>
                <li>No spam or self-promotion.</li>
                <li>Pick the community that fits.</li>
              </ul>
            </div>
            <AdUnit
              adSlot="display-vertical"
              key="communities-context-sidebar"
            />
          </div>
        </aside>
      </div>
    </>
  );
}

async function Feed({
  category,
  sort,
  page,
}: {
  category: string;
  sort: FeedSort;
  page: number;
}) {
  const [rows, session] = await Promise.all([
    getPostsByCategory(category, page, PAGE_SIZE + 1, sort),
    getSession(),
  ]);
  const hasNext = rows.length > PAGE_SIZE;
  const posts = rows.slice(0, PAGE_SIZE);

  if (posts.length === 0) {
    return page > 1 ? (
      <EmptyState
        icon={<MessageSquareText className="size-6" aria-hidden="true" />}
        title="No more posts"
        description="You've reached the end of this feed."
        action={
          <ButtonLink href={feedHref({ category, sort })} variant="outline">
            Back to the first page
          </ButtonLink>
        }
      />
    ) : (
      <EmptyState
        icon={<MessageSquareText className="size-6" aria-hidden="true" />}
        title="No posts here yet"
        description="Start the first thread and others can reply to it."
        action={
          <ButtonLink
            href={`/community/create${category !== "all" ? `?c=${category}` : ""}`}
            variant="outline"
          >
            <PenLine />
            Write a post
          </ButtonLink>
        }
      />
    );
  }

  const commentCounts = await getCommentCounts(posts.map((p) => p._id));

  return (
    <div className="flex flex-col gap-6">
      <CommunityPostList
        posts={posts}
        user={session?.user}
        commentCounts={commentCounts}
        groupByDate={sort === "recent"}
      />
      {(page > 1 || hasNext) && (
        <nav
          aria-label="Feed pages"
          className="flex items-center justify-between gap-3"
        >
          {page > 1 ? (
            <ButtonLink
              href={feedHref({ category, sort, page: page - 1 })}
              variant="outline"
            >
              <ArrowLeft />
              Previous
            </ButtonLink>
          ) : (
            <span />
          )}
          <p className="text-caption text-muted-foreground tabular-nums">
            Page {page}
          </p>
          {hasNext ? (
            <ButtonLink
              href={feedHref({ category, sort, page: page + 1 })}
              variant="outline"
            >
              Next
              <ArrowRight />
            </ButtonLink>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }, (_, i) => (
        <PostCardSkeleton key={`post-skeleton-${i.toString()}`} />
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-xl border border-border bg-card text-foreground dark:bg-background">
        {icon}
      </span>
      <h3 className="mt-4 text-body-lg font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-body text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
