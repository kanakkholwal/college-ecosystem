"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { CircleCheckBig, Dot, MousePointerClick } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import type { PollType } from "src/models/poll";
import type { Session } from "~/auth/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PollingProps {
  poll: PollType;
  user: Session["user"];
  updateVotes: (voteData: PollType["votes"]) => Promise<PollType>;
}


export default function Polling({ poll, user, updateVotes }: PollingProps) {
  const [voteData, setVoteData] = useState<PollType["votes"]>(poll.votes);

  const handleVote = async (option: string) => {
    if (!voteData) return;

    let updatedVotes = [...voteData];
    const existingVoteIndex = updatedVotes.findIndex(
      (vote) => vote.userId === user.id && vote.option === option
    );

    if (existingVoteIndex > -1) {
      // User already voted on this option
      if (!poll.multipleChoice) {
        updatedVotes.splice(existingVoteIndex, 1);
      }
    } else {
      if (!poll.multipleChoice) {
        updatedVotes = updatedVotes.filter((vote) => vote.userId !== user.id);
      }
      updatedVotes.push({ option, userId: user.id });
    }

    const { error } = await supabase
      .from("polls")
      .update({ votes: updatedVotes })
      .eq("id", poll._id);

    if (error) {
      toast.error("Failed to submit vote");
      return;
    }

    setVoteData(updatedVotes);
  };

  const handleSync = useCallback(async () => {
    try {
      await updateVotes(voteData);
    } catch (error) {
      console.error("Error updating poll:", error);
    }
  }, [updateVotes, voteData]);

  useEffect(() => {
    const channel = supabase
      .channel(`polls-${poll._id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "polls",
          filter: `id=eq.${poll._id}`,
        },
        (payload) => {
          const newData = payload.new as PollType;
          setVoteData(newData?.votes || []);
        }
      )
      .subscribe();

    return () => {
      handleSync();
      supabase.removeChannel(channel);
    };
  }, [handleSync, poll._id]);

  useEffect(() => {
    if (poll.votes.length !== voteData.length) {
      handleSync();
    }
  }, [handleSync, poll.votes.length, voteData.length]);

  return (
    <div className="space-y-4">
      {poll.options.map((option, index) => {
        const totalVotes = voteData.length || 1;
        const count = voteData.filter((v) => v.option === option).length;
        const percent = (count / totalVotes) * 100;

        const hasVoted = voteData.some(
          (v) => v.userId === user.id && v.option === option
        );
        const { disabled, message, btnText } = notAllowed(
          voteData,
          poll.multipleChoice,
          user,
          option
        );
        return (
          <motion.div
            key={`${option}-${index}`}
            className={cn(
              "relative overflow-hidden rounded-xl border border-border bg-muted",
              hasVoted && "border border-primary",
            )}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Progress Bar */}
            <motion.div
              className={`absolute inset-y-0 left-0 bg-primary/20`}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            <div className="relative z-10 p-4  flex cursor-pointer flex-row items-start justify-between rounded-md shadow-none transition-all">

              <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 flex-1 p-0">
                <div data-slot="card-title" className="font-semibold flex items-center gap-2 text-sm">
                  {option}
                  <span className="font-normal text-muted-foreground text-xs">
                    {/* (the first option) */}
                  </span>
                </div>
                <div data-slot="card-description" className="text-muted-foreground text-sm">
                  {/* {btnText} */}
                </div>
                <div className="flex gap-1 text-xs text-muted-foreground font-medium">
                  <span>
                    {percent.toFixed(1)}%
                  </span>
                  <Dot className="inline-block -mx-1 size-4" />
                  <span className="font-semibold text-primary">{count} votes</span>
                </div>
              </div>
              {/* Vote Button */}
              <Button
                size="sm"
                shadow={disabled ? "none" : hasVoted ? "none" : "default"}
                variant={hasVoted ? "glass" : "outline"}
                title={message}
                onClick={() => handleVote(option)}
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


// utils
function notAllowed(
  voteData: PollType["votes"],
  multipleChoice: boolean,
  user: Session["user"],
  option: string
) {
  switch (true) {
    case !multipleChoice:
      return {
        disabled: voteData?.some((vote) => vote.userId === user.id),
        message: "You can only vote once",
        btnText: voteData?.some((vote) => vote.userId === user.id)
          ? "Voted"
          : "Vote",
      };
    case multipleChoice &&
      voteData?.some(
        (vote) => vote.userId === user.id && vote.option === option
      ):
      return {
        disabled: true,
        message: "You have already voted",
        btnText: "Voted",
      };
    default:
      return {
        disabled: false,
        message: "",
        btnText: "Vote",
      };
  }
}

function parseVotes(votes: PollType["votes"], option: string) {
  const count = votes?.filter((vote) => vote.option === option).length || 0;
  const percent = votes && votes.length > 0 ? (count / votes.length) * 100 : 0;
  return { option, count, percent };
}
