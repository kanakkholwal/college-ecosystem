"use client";

import { useOptimistic, useTransition } from "react";
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
    const [optimisticVotes, setOptimisticVotes] = useOptimistic<PollType["votes"]>(
        poll.votes
    );

    const handleVote = async (option: string) => {
        if (isPending) return;

        const currentVotes = optimisticVotes;
        let updatedVotes = [...currentVotes];
        const existingVoteIndex = updatedVotes.findIndex(
            (vote) => vote.userId === user.id && vote.option === option
        );

        if (existingVoteIndex > -1) {
            if (!poll.multipleChoice) {
                updatedVotes.splice(existingVoteIndex, 1);
            }
        } else {
            if (!poll.multipleChoice) {
                updatedVotes = updatedVotes.filter((vote) => vote.userId !== user.id);
            }
            updatedVotes.push({ option, userId: user.id, createdAt: new Date() });
        }

        startTransition(async () => {
            setOptimisticVotes(updatedVotes);

            try {
                const result = await updateVotes(updatedVotes);
                setOptimisticVotes(result.votes);
                toast.success("Vote recorded!");
            } catch (error) {
                console.error("Error casting vote:", error);
                setOptimisticVotes(currentVotes);
                toast.error("Failed to submit vote");
            }
        });
    };

    return {
        voteData: optimisticVotes,
        handleVote,
        isVoting: isPending,
    };
}