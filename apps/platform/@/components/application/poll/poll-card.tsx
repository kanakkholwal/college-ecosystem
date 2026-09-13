import {
  AuthorAvatar,
  RelativeTime,
} from "@/components/application/community/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PollMenu } from "./poll-menu";
import { PollStatus } from "./poll-timer";
import { PollVoter } from "./poll-voter";
import { type PollView, pollHref } from "./utils";

/** Feed card: author and status, the question, then the inline ballot or its results. */
export function PollCard({
  poll,
  now,
  signedIn,
  canManage,
  className,
}: {
  poll: PollView;
  now: number;
  signedIn: boolean;
  canManage: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md sm:p-5 dark:bg-background",
        className
      )}
    >
      <header className="flex items-center gap-3">
        <AuthorAvatar name={poll.createdBy} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${poll.createdBy}`}
            className="relative z-10 block truncate text-body font-medium text-foreground outline-none hover:underline focus-visible:underline"
          >
            @{poll.createdBy}
          </Link>
          <p className="text-caption text-muted-foreground">
            Asked <RelativeTime date={poll.createdAt} />
          </p>
        </div>
        <PollStatus closesAt={poll.closesAt} now={now} />
        <PollMenu
          pollId={poll.id}
          question={poll.question}
          canManage={canManage}
          className="-mr-2"
        />
      </header>

      <div className="min-w-0">
        <h3 className="text-pretty text-body-lg font-medium text-foreground">
          <Link
            href={pollHref(poll.id)}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {poll.question}
          </Link>
        </h3>
        {poll.description && (
          <p className="mt-1 line-clamp-2 text-pretty text-body wrap-break-word text-muted-foreground">
            {poll.description}
          </p>
        )}
      </div>

      <PollVoter
        poll={poll}
        now={now}
        signedIn={signedIn}
        collapseAfter={4}
        className="mt-auto"
      />
    </article>
  );
}

export function PollCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 dark:bg-background">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton
            key={`poll-option-skeleton-${i.toString()}`}
            className="h-11 w-full rounded-xl"
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
