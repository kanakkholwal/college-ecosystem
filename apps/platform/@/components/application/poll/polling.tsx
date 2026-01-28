"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import type { PollType } from "src/models/poll";
import type { Session } from "~/auth/client";
import { usePollVoting } from "./use-poll-voting";

interface PollingProps {
  poll: PollType;
  user: Session["user"];
  updateVotes: (voteData: PollType["votes"]) => Promise<PollType>;
}

export default function Polling({ poll, user, updateVotes }: PollingProps) {
  const { voteData, handleVote } = usePollVoting({ poll, user, updateVotes });
  const [loadingOption, setLoadingOption] = useState<string | null>(null);

  const onVoteClick = async (option: string) => {
    setLoadingOption(option);
    await handleVote(option);
    setLoadingOption(null);
  };

  const totalVotes = voteData.length || 0;

  return (
    <div className="grid gap-3">
      {poll.options.map((option) => {
        const count = voteData.filter((v) => v.option === option).length;
        const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        const hasVoted = voteData.some(
          (v) => v.userId === user.id && v.option === option
        );
        const isVotingForThis = loadingOption === option;

        return (
          <div
            key={option}
            className={cn(
              "relative overflow-hidden rounded-xl border transition-all duration-200",
              hasVoted
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "bg-card hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            {/* Progress Bar Background */}
            <motion.div
              className={cn(
                "absolute inset-y-0 left-0 z-0",
                hasVoted ? "bg-primary/10" : "bg-muted/50"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: "circOut" }}
            />

            <div className="relative z-10 flex items-center justify-between p-3 sm:px-4">
              {/* Left: Option Text & Indicator */}
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    hasVoted
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  )}
                >
                  {hasVoted && <Check className="h-3 w-3" />}
                </div>
                <span
                  className={cn(
                    "font-medium text-sm sm:text-base truncate transition-colors",
                    hasVoted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {option}
                </span>
              </div>

              {/* Right: Stats & Action */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="font-bold text-sm text-foreground">
                    {percent.toFixed(0)}%
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                    {count} {count === 1 ? "vote" : "votes"}
                  </span>
                </div>

                {!hasVoted && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onVoteClick(option)}
                    disabled={!!loadingOption}
                    className="h-8 px-3 text-xs font-semibold shadow-sm transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    {isVotingForThis ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Vote"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex justify-end px-1 mt-1">
        <p className="text-xs text-muted-foreground font-medium">
          Total votes: <span className="text-foreground">{totalVotes}</span>
        </p>
      </div>
    </div>
  );
}