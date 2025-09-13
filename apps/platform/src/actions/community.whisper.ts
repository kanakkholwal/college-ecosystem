"use server";

import { getSession } from "~/auth/server";
import { postReactions } from "~/constants/community.whispers";
import dbConnect from "~/lib/dbConnect";
import { WhisperPostModel } from "~/models/whispers";

export async function reactToPost(postId: string, reaction: typeof postReactions[number]) {
    // Perform database operations here
    if (!postId || !reaction) {
        throw new Error("Invalid postId or reaction");
    }
    const session = await getSession();
    if (!session) {
        throw new Error("User not authenticated");
    }
    try {
        await dbConnect();
        const correspondingPost = await WhisperPostModel.findById(postId);
        if (!correspondingPost) {
            throw new Error("Post not found");
        }
        // Check if the user has already reacted to the post
        const existingReaction = correspondingPost.reactions.find(
            (r) => r.userId === session.user.id
        );
        if (existingReaction) {
            // If the user has already reacted, update the reaction
            existingReaction.type = reaction;
        } else {
            // If the user has not reacted, add a new reaction
            correspondingPost.reactions.push({
                userId: session.user.id,
                type: reaction,
            });
        }
        await correspondingPost.save();
        return Promise.resolve(true);

    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}