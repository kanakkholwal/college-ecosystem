"use client";

import { useOptimistic, useState, useTransition } from "react";
import toast from "react-hot-toast";
import type { PollType } from "src/models/poll";
import type { Session } from "~/auth/client";

interface UsePollVotingProps {
  poll: PollType;
  user: Session["user"];
  updateVotes: (voteData: PollType["votes"]) => Promise<PollType>;
}

export function usePollVoting({ poll, user, updateVotes }: UsePollVotingProps) {
  const [isPending, startTransition] = useTransition();
  // Confirmed votes live in state: the action doesn't revalidate this page, so the prop stays stale.
  const [votes, setVotes] = useState<PollType["votes"]>(poll.votes);
  const [optimisticVotes, setOptimisticVotes] =
    useOptimistic<PollType["votes"]>(votes);
  const [pendingOption, setPendingOption] = useState<string | null>(null);

  const handleVote = (option: string) => {
    if (isPending) return;

    let updatedVotes = [...votes];
    const existingVoteIndex = updatedVotes.findIndex(
      (vote) => vote.userId === user.id && vote.option === option
    );

    if (existingVoteIndex > -1) {
      if (!poll.multipleChoice) updatedVotes.splice(existingVoteIndex, 1);
    } else {
      if (!poll.multipleChoice) {
        updatedVotes = updatedVotes.filter((vote) => vote.userId !== user.id);
      }
      updatedVotes.push({ option, userId: user.id, createdAt: new Date() });
    }

    setPendingOption(option);
    startTransition(async () => {
      setOptimisticVotes(updatedVotes);
      try {
        const result = await updateVotes(updatedVotes);
        startTransition(() => setVotes(result.votes));
        toast.success("Vote recorded");
      } catch (error) {
        console.error("Error casting vote:", error);
        toast.error("Couldn't record your vote");
      } finally {
        setPendingOption(null);
      }
    });
  };

  return {
    voteData: optimisticVotes,
    handleVote,
    isVoting: isPending,
    pendingOption,
  };
}
