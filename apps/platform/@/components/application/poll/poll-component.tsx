import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { Check, Clock, User } from "lucide-react";
import Link from "next/link";
import { BiUpvote } from "react-icons/bi";
import type { PollType } from "src/models/poll";
import type { Session } from "~/auth/client";
import DeletePoll from "./delete-poll";
import { ClosingBadge } from "./poll-timer";

// Helper Functions 

function parseVotes(votes: PollType["votes"], option: string) {
  const count = votes?.filter((vote) => vote.option === option).length || 0;
  const totalVotes = votes?.length || 0;
  const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
  return { option, count, percent };
}

function notAllowed(
  voteData: PollType["votes"],
  multipleChoice: boolean,
  option: string,
  user?: Session["user"]
) {
  if (!user) {
    return { disabled: true, voted: false };
  }

  const userVotes = voteData?.filter((vote) => vote.userId === user.id) || [];
  const hasVotedForOption = userVotes.some((vote) => vote.option === option);
  const hasVotedAtAll = userVotes.length > 0;

  if (!multipleChoice) {
    // Single choice: Disabled if voted at all, voted true if voted for this specific option
    return {
      disabled: hasVotedAtAll,
      voted: hasVotedForOption, // Correctly show checkmark only for the selected option
    };
  } else {
    // Multiple choice: Disabled if already voted for this specific option
    return {
      disabled: hasVotedForOption,
      voted: hasVotedForOption,
    };
  }
}

//  Components 

function PollHeader({ poll }: { poll: PollType }) {
  const createdAt = poll?.createdAt
    ? new Date(poll.createdAt).toLocaleString("default", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : "";

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight">
        {poll.question}
      </h3>
      {poll.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {poll.description}
        </p>
      )}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
          <User className="w-3 h-3" />
          <Link
            className="text-foreground hover:text-primary transition-colors"
            href={`/u/${poll?.createdBy}`}
          >
            @{poll?.createdBy}
          </Link>
        </div>
        <span>•</span>
        <span>{createdAt}</span>
      </div>
    </div>
  );
}

export function PollOptions({ poll, user }: { poll: PollType; user?: Session["user"] }) {
  return (
    <div className="grid gap-3 mt-5">
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
            className={cn(
              "relative w-full rounded-lg border overflow-hidden group transition-all",
              voted ? "border-primary/50 shadow-sm" : "border-border hover:border-primary/30"
            )}
          >
            {/* Progress Bar Background */}
            <div
              className={cn(
                "absolute left-0 top-0 h-full transition-all duration-700 ease-out",
                voted ? "bg-primary/20" : "bg-muted/40"
              )}
              style={{ width: `${count > 0 ? Math.max(2, percent) : 0}%` }}
            />

            {/* Content Button */}
            <button
              aria-label={`Vote for ${option}`}
              disabled={disabled}
              className={cn(
                "relative z-10 flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors disabled:cursor-default",
                voted ? "text-primary" : "text-foreground"
              )}
            >
              <div className="flex items-center gap-3 text-left">
                <div
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full border transition-colors",
                    voted
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  )}
                >
                  {voted && <Check className="w-3 h-3" />}
                </div>
                <span className={cn(voted && "font-semibold")}>{option}</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded backdrop-blur-[2px]">
                <span className="font-semibold text-foreground">
                  {percent.toFixed(0)}%
                </span>
                <span className="opacity-70">({count})</span>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function PollStats({ poll }: { poll: PollType }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-border/50 text-xs text-muted-foreground">
      <div className="flex gap-3">
        <span className="flex items-center gap-1.5 font-medium">
          <BiUpvote className="w-4 h-4 text-primary" />
          {poll.votes.length} votes
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <ClosingBadge poll={poll} />
        </span>
      </div>
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
  const closesAlready = new Date(poll.closesAt) < new Date();
  const isCreator = (user?.id === poll.createdBy) || user?.role === "admin";

  return (
    <div className="bg-card p-6 rounded-xl relative border border-border/60 shadow-sm transition-all hover:shadow-md hover:border-border/80 flex flex-col h-full">

      <PollHeader poll={poll} />

      <PollOptions poll={poll} user={user} />

      <div className="mt-auto">
        <PollStats poll={poll} />

        <div className="flex items-center justify-end gap-3 mt-4">
          {isCreator && <DeletePoll pollId={poll._id} />}

          <ButtonLink
            variant="default"
            size="sm"
            className="rounded-full px-5 font-medium shadow-sm hover:shadow transition-all group"
            href={`/polls/${poll._id}`}
            icon="arrow-right"
            iconPlacement="right"
          >
            {closesAlready ? "Check Results" : "Vote Now"}
          </ButtonLink>

        </div>
      </div>
    </div>
  );
}