import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";
import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CommunityPostTypeWithId } from "~/models/community";
import { formatNumber } from "~/utils/number";
import { PostActions } from "./post-actions";
import { PostMenu } from "./post-menu";
import {
  canManagePost,
  feedHref,
  getCategory,
  initials,
  toExcerpt,
} from "./utils";

type Viewer = { id: string; role?: string | null } | null | undefined;

export function AuthorAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full border border-border bg-muted text-caption font-semibold text-foreground",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

export function CategoryChip({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const category = getCategory(value);
  return (
    <Link
      href={feedHref({ category: value })}
      className={cn(
        "relative z-10 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card py-1 pr-3 pl-1 text-caption font-medium text-foreground outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring dark:bg-background",
        className
      )}
    >
      {category ? (
        <Image
          src={category.image}
          alt=""
          width={24}
          height={24}
          className="size-6 rounded-full border border-border object-cover"
        />
      ) : null}
      <span className="sr-only">Community: </span>
      {category?.name ?? value}
    </Link>
  );
}

export function RelativeTime({ date }: { date: Date | string }) {
  const d = new Date(date);
  return (
    <time
      dateTime={d.toISOString()}
      title={d.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      })}
    >
      {formatDistanceToNowStrict(d, { addSuffix: true })}
    </time>
  );
}

/** Feed card: author and community, title, a plain-text preview, then like, comment and save. */
export function PostCard({
  post,
  viewer,
  commentCount,
  className,
}: {
  post: CommunityPostTypeWithId;
  viewer?: Viewer;
  commentCount?: number;
  className?: string;
}) {
  const href = `/community/posts/${post._id}`;
  const excerpt = toExcerpt(post.content);
  const likes = post.likes ?? [];
  const savedBy = post.savedBy ?? [];

  return (
    <article
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 pt-4 pb-2 transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md sm:px-5 sm:pt-5 dark:bg-background",
        className
      )}
    >
      <header className="flex items-center gap-3">
        <AuthorAvatar name={post.author.name} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${post.author.username}`}
            className="relative z-10 block truncate text-body font-medium text-foreground outline-none hover:underline focus-visible:underline"
          >
            {post.author.name}
          </Link>
          <p className="flex min-w-0 items-center gap-1.5 text-caption text-muted-foreground">
            <span className="truncate">@{post.author.username}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">
              <RelativeTime date={post.createdAt} />
            </span>
          </p>
        </div>
        <CategoryChip value={post.category} className="hidden sm:inline-flex" />
        <PostMenu
          postId={post._id}
          title={post.title}
          canManage={canManagePost(viewer, post)}
          className="-mr-2"
        />
      </header>

      <div className="min-w-0">
        <CategoryChip value={post.category} className="mb-2 sm:hidden" />
        <h3 className="text-pretty text-body-lg font-medium text-foreground">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {post.title}
          </Link>
        </h3>
        {excerpt.text && (
          <p className="mt-1.5 line-clamp-4 text-pretty break-words text-body leading-relaxed text-muted-foreground">
            {excerpt.text}
          </p>
        )}
        {excerpt.truncated && (
          <Link
            href={href}
            className="relative z-10 mt-1 inline-flex min-h-10 items-center text-body font-medium text-primary outline-none hover:underline focus-visible:underline sm:min-h-0"
          >
            Read more<span className="sr-only">: {post.title}</span>
          </Link>
        )}
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-border pt-2">
        <PostActions
          postId={post._id}
          likeCount={likes.length}
          liked={!!viewer && likes.includes(viewer.id)}
          saved={!!viewer && savedBy.includes(viewer.id)}
          signedIn={!!viewer}
          commentHref={`${href}#comments`}
          commentCount={commentCount}
          className="-ml-3"
        />
        <p className="flex items-center gap-1.5 pr-1 text-caption text-muted-foreground tabular-nums">
          <Eye className="size-4" aria-hidden="true" />
          {formatNumber(post.views ?? 0)}
          <span className="sr-only">views</span>
        </p>
      </footer>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 pt-4 pb-2 sm:px-5 sm:pt-5 dark:bg-background">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="hidden h-8 w-24 rounded-full sm:block" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex items-center justify-between border-t border-border py-2">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-16 rounded-full" />
          <Skeleton className="h-10 w-16 rounded-full" />
          <Skeleton className="h-10 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-10" />
      </div>
    </div>
  );
}
