import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Clock } from "lucide-react";
import Link from "next/link";
import { BiUpvote } from "react-icons/bi";
import type { PollType } from "src/models/poll";
import type { Session } from "~/auth/client";
import DeletePoll from "./delete-poll";
import { ClosingBadge } from "./poll-timer";

export default function PollComponent({
  poll,
  user,
}: {
  poll: PollType;
  user?: Session["user"];
}) {
  const closesAlready = new Date(poll.closesAt) < new Date();

  return (
    <div className="bg-card p-6 rounded-2xl mt-3 flex flex-col gap-4 border shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground leading-snug">
          {poll.question}
        </h3>
        {poll.description && (
          <p className="text-sm text-muted-foreground">{poll.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            by{" "}
            <Link
              className="text-foreground hover:underline font-medium"
              href={`/u/${poll?.createdBy}`}
            >
              @{poll?.createdBy}
            </Link>
          </span>
          <span>•</span>
          <span>
            {poll?.createdAt
              ? new Date(poll.createdAt).toLocaleString("default", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>
      </div>

      {/* Poll Options */}
      <PollRender poll={poll} user={user} />

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
        <span className="rounded-full bg-muted/70 text-muted-foreground px-3 py-1 inline-flex items-center gap-1.5">
          <BiUpvote className="w-4 h-4" />
          {poll.votes.length} votes
        </span>
        <span className="rounded-full bg-muted/70 text-muted-foreground px-3 py-1 inline-flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <ClosingBadge poll={poll} />
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {user?.id === poll.createdBy && <DeletePoll pollId={poll._id} />}
        {!closesAlready && (
          <Button
            variant="default"
            size="sm"
            className="rounded-lg shadow-sm hover:shadow-md transition-all gap-1"
            asChild
          >
            <Link href={`/polls/${poll._id}`}>
              Vote
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function PollRender({
  poll,
  user,
}: {
  poll: PollType;
  user?: Session["user"];
}) {
  return (
    <div className="grid gap-3 mt-4">
      {poll.options.map((option, index) => {
        const { percent, count } = parseVotes(poll.votes, option);
        const { disabled, voted } = notAllowed(
          poll.votes,
          poll.multipleChoice,
          option,
          user
        );

        return (
          <div
            key={index}
            className="relative w-full rounded-lg border overflow-hidden group"
          >
            {/* Progress background */}
            <div
              className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                voted ? "bg-primary/30" : "bg-primary/15"
              }`}
              style={{ width: `${count > 0 ? Math.max(1, percent) : 0}%` }}
            />

            {/* Option Row */}
            <button
              aria-label={`Vote for ${option}`}
              disabled={disabled}
              className={cn(`relative z-10 flex w-full items-center justify-between px-4 py-2 text-sm font-medium transition-colors`, {
                "text-primary font-semibold": voted,
                "text-foreground hover:bg-muted/60": !voted,
                "disabled:cursor-not-allowed disabled:opacity-80": disabled,
              })}
            >
              <div className="flex items-center gap-2">
                {voted && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
                <span>{option}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{percent.toFixed(1)}%</span>
                <span className="hidden sm:inline">({count})</span>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}


/* Helpers */
function notAllowed(
  voteData: PollType["votes"],
  multipleChoice: boolean,
  option: string,
  user?: Session["user"]
) {
  if (!user) {
    return { disabled: true, voted: false };
  }
  switch (true) {
    case !multipleChoice:
      return {
        disabled: voteData?.some((vote) => vote.userId === user.id),
        voted: voteData?.some((vote) => vote.userId === user.id),
      };
    case multipleChoice &&
      voteData?.some(
        (vote) => vote.userId === user.id && vote.option === option
      ):
      return { disabled: true, voted: true };
    default:
      return { disabled: false, voted: false };
  }
}

function parseVotes(votes: PollType["votes"], option: string) {
  const count = votes?.filter((vote) => vote.option === option).length || 0;
  const percent = votes && votes.length > 0 ? (count / votes.length) * 100 : 0;
  return { option, count, percent };
}
