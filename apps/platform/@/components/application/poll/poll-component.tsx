import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowRight, Check, Clock, Lock } from "lucide-react";
import Link from "next/link";
import type { PollType } from "src/models/poll";
import type { Session } from "~/auth/client";
import DeletePoll from "./delete-poll";
import { ClosingBadge } from "./poll-timer";

export function tallyVotes(votes: PollType["votes"], option: string) {
  const total = votes?.length ?? 0;
  const count = votes?.filter((vote) => vote.option === option).length ?? 0;
  return { count, percent: total > 0 ? (count / total) * 100 : 0 };
}

export const isPollClosed = (poll: Pick<PollType, "closesAt">) =>
  new Date(poll.closesAt).getTime() <= Date.now();

/** Open or closed, always with a glyph and a word. */
export function PollStatus({
  poll,
  className,
}: {
  poll: Pick<PollType, "closesAt">;
  className?: string;
}) {
  const closed = isPollClosed(poll);
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit items-center gap-1.5 rounded-full border px-2 text-caption font-medium",
        closed
          ? "border-border text-muted-foreground"
          : "border-primary/30 bg-primary/10 text-primary",
        className
      )}
    >
      {closed ? (
        <Lock className="size-3.5" aria-hidden="true" />
      ) : (
        <Clock className="size-3.5" aria-hidden="true" />
      )}
      <ClosingBadge poll={{ closesAt: poll.closesAt }} />
    </span>
  );
}

/** Read-only results: one bar per option, the viewer's own picks marked with a check and a word. */
export function PollOptions({
  poll,
  user,
  limit,
}: {
  poll: PollType;
  user?: Session["user"];
  limit?: number;
}) {
  const options = limit ? poll.options.slice(0, limit) : poll.options;
  const hidden = poll.options.length - options.length;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {options.map((option) => {
          const { percent, count } = tallyVotes(poll.votes, option);
          const voted =
            !!user &&
            poll.votes.some((v) => v.userId === user.id && v.option === option);
          return (
            <li key={option} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-body">
                <span className="flex min-w-0 items-center gap-1.5 text-foreground">
                  {voted && (
                    <Check
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                  <span className="truncate">{option}</span>
                  {voted && (
                    <span className="shrink-0 text-caption font-medium text-primary">
                      Your vote
                    </span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {percent.toFixed(0)}%
                  </span>{" "}
                  ({count})
                </span>
              </div>
              <span
                aria-hidden="true"
                className="block h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${percent}%` }}
                />
              </span>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && (
        <p className="text-caption text-muted-foreground">
          +{hidden} more {hidden === 1 ? "option" : "options"}
        </p>
      )}
    </div>
  );
}

export default function PollComponent({
  poll,
  user,
}: {
  poll: PollType;
  user?: Session["user"];
}) {
  const closed = isPollClosed(poll);
  const canDelete =
    !!user && (user.username === poll.createdBy || user.role === "admin");
  const votes = poll.votes.length;

  return (
    <article className="relative flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring dark:bg-background">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <PollStatus poll={poll} />
          <h3 className="text-body-lg font-medium text-foreground">
            <Link
              href={`/polls/${poll._id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl"
            >
              {poll.question}
            </Link>
          </h3>
          {poll.description && (
            <p className="line-clamp-2 text-body text-muted-foreground">
              {poll.description}
            </p>
          )}
        </div>
        {canDelete && (
          <DeletePoll pollId={poll._id} className="relative z-10 shrink-0" />
        )}
      </div>

      <PollOptions poll={poll} user={user} limit={4} />

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-caption">
        <span className="text-muted-foreground">
          <span className="tabular-nums">
            {votes} {votes === 1 ? "vote" : "votes"}
          </span>{" "}
          · by{" "}
          <Link
            href={`/u/${poll.createdBy}`}
            className="relative z-10 font-medium text-foreground hover:underline"
          >
            @{poll.createdBy}
          </Link>{" "}
          · {format(new Date(poll.createdAt), "d MMM yyyy")}
        </span>
        <span className="flex items-center gap-1 font-medium text-primary">
          {closed ? "See results" : "Vote"}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

export function PollCardSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 dark:bg-background">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={`option-${i.toString()}`} className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-border pt-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}
