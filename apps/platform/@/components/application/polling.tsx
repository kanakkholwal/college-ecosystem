"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { CircleCheckBig, Dot, MousePointerClick } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { z } from "zod";
import type { Session } from "~/auth/client";
import { PollSchema } from "~/constants/community.whispers";

export type PollType = z.infer<typeof PollSchema>;

export function PollDisplay({
  poll,
  user,
  pollRefId,
  settings
}: PollingProps) {
  return (
    <div className="grid gap-3 mt-4">
      {poll.options.map((option) => {
        const { percent, count } = parseVotes(poll.options, option);
        const { disabled, voted } = notAllowed(poll.options, settings?.multipleChoice, user, option);

        return (
          <div
            key={pollRefId + "_" + option.id}
            className="relative w-full rounded-lg border overflow-hidden group"
          >
            {/* Progress background */}
            <div
              className={cn(
                "absolute left-0 top-0 h-full transition-all duration-500",
                voted ? "bg-primary/30" : "bg-primary/15"
              )}
              style={{ width: `${count > 0 ? Math.max(1, percent) : 0}%` }}
            />

            {/* Option Row */}
            <button
              aria-label={`Vote for ${option.text}`}
              disabled={disabled}
              className={cn(
                "relative z-10 flex w-full items-center justify-between px-4 py-2 text-sm font-medium transition-colors",
                {
                  "text-primary font-semibold": voted,
                  "text-foreground hover:bg-muted/60": !voted,
                  "disabled:cursor-not-allowed disabled:opacity-80": disabled,
                }
              )}
            >
              <div className="flex items-center gap-2">
                {voted && <Check className="h-4 w-4 text-primary shrink-0" />}
                <span>{option.text}</span>
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



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PollingProps {
  poll: PollType;
  pollRefId: string;
  settings?: {
    multipleChoice?: boolean;
    anonymousVotes?: boolean;
  }
  user: Session["user"];
  updatePoll: (pollRefId: string, poll: PollType) => Promise<PollType>;
}

export default function PollingFunctional({ poll, user, updatePoll, settings, pollRefId }: PollingProps) {
  const [options, setOptions] = useState<PollType["options"]>(poll.options);

  const handleVote = async (optionId: string) => {
    let updatedOptions = [...options];

    updatedOptions = updatedOptions.map((opt) => {
      // remove previous votes if not multiple choice
      if (opt.votes.includes(user.id) && opt.id !== optionId && !settings?.multipleChoice) {
        return { ...opt, votes: opt.votes.filter((v) => v !== user.id) };
      }
      // toggle vote on the clicked option
      if (opt.id === optionId) {
        if (opt.votes.includes(user.id)) {
          return {
            ...opt,
            votes: settings?.multipleChoice ? opt.votes.filter((v) => v !== user.id) : opt.votes,
          };
        } else {
          return { ...opt, votes: [...opt.votes, user.id] };
        }
      }
      return opt;
    });

    const { error } = await supabase
      .from("polls")
      .update({ options: updatedOptions })
      .eq("id", pollRefId);

    if (error) {
      toast.error("Failed to submit vote");
      return;
    }

    setOptions(updatedOptions);
  };

  const handleSync = useCallback(async () => {
    try {
      await updatePoll(pollRefId, { ...poll, options });
    } catch (error) {
      console.error("Error updating poll:", error);
    }
  }, [updatePoll, pollRefId, options, settings?.anonymousVotes]);


  useEffect(() => {
    const channel = supabase
      .channel(`polls-${pollRefId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "polls",
          filter: `id=eq.${pollRefId}`,
        },
        (payload) => {
          const newData = payload.new as PollType;
          setOptions(newData?.options || []);
        }
      )
      .subscribe();

    return () => {
      handleSync();
      supabase.removeChannel(channel);
    };
  }, [handleSync, pollRefId]);

  useEffect(() => {
    const id = setTimeout(() => {
      const changed = JSON.stringify(poll.options) !== JSON.stringify(options);
      if (changed) handleSync();
    }, 500); // debounce 500ms
    return () => clearTimeout(id);
  }, [handleSync, poll.options, options]);


  return (
    <div className="space-y-4">
      {options.map((option) => {
        const totalVotes = options.reduce((acc, opt) => acc + opt.votes.length, 0) || 1;
        const count = option.votes.length;
        const percent = (count / totalVotes) * 100;

        const hasVoted = option.votes.includes(user.id);
        const { disabled, message } = notAllowed(options, settings?.multipleChoice, user, option);

        return (
          <motion.div
            key={pollRefId + "_" + option.id}
            className={cn(
              "relative overflow-hidden rounded-xl border border-border bg-muted",
              hasVoted && "border border-primary"
            )}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Progress Bar */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary/20"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            <div className="relative z-10 p-4 flex flex-row items-start justify-between rounded-md shadow-none transition-all">
              <div className="flex-1 grid gap-1.5">
                <div className="font-semibold flex items-center gap-2 text-sm">
                  {option.text}
                </div>
                <div className="flex gap-1 text-xs text-muted-foreground font-medium">
                  <span>{percent.toFixed(1)}%</span>
                  <Dot className="inline-block -mx-1 size-4" />
                  <span className="font-semibold text-primary">{count} votes</span>
                </div>
              </div>
              {/* Vote Button */}
              <Button
                size="sm"
                variant={hasVoted ? "glass" : "outline"}
                title={message}
                disabled={disabled}
                onClick={() => handleVote(option.id)}
              >
                {hasVoted ? (
                  <CircleCheckBig className="shrink-0" />
                ) : (
                  <MousePointerClick className="shrink-0" />
                )}
                <span>{hasVoted ? "You Backed This" : "Back This"}</span>
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* Utils */
function notAllowed(
  options: PollType["options"],
  multipleChoice: boolean | undefined,
  user: Session["user"],
  option: PollType["options"][number]
) {
  if (!user) return { disabled: true, message: "Login to vote" };

  const hasVotedInThis = option.votes.includes(user.id);
  const hasVotedAnywhere = options.some((opt) => opt.votes.includes(user.id));

  if (!multipleChoice && hasVotedAnywhere && !hasVotedInThis) {
    return { disabled: true, message: "You can only vote once", voted: hasVotedAnywhere };
  }
  if (multipleChoice && hasVotedInThis) {
    return { disabled: true, message: "You already voted here", voted: hasVotedInThis };
  }
  return { disabled: false, message: "", voted: hasVotedInThis };
}



function parseVotes(
  options: PollType["options"],
  option: PollType["options"][number]
) {
  const totalVotes = options.reduce((acc, opt) => acc + opt.votes.length, 0);
  const count = option.votes.length;
  const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
  return { count, percent };
}
