"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "~/auth/server";
import { PollT, postReactions, rawWhisperPostSchema, WhisperPostT } from "~/constants/community.whispers";
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
            if(existingReaction.type !== reaction) {
                // If the reaction is different, update the reaction
                existingReaction.type = reaction;
            } else {
                // If the reaction is the same, remove the reaction
                correspondingPost.reactions = correspondingPost.reactions.filter(
                    (r) => r.userId !== session.user.id
                );
            }
        } else {
            // If the user has not reacted, add a new reaction
            correspondingPost.reactions.push({
                userId: session.user.id,
                type: reaction,
            });
        }
        await correspondingPost.save();
        revalidatePath("/whisper-room/feed");
        return Promise.resolve(true);

    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

export async function createWhisperPost(rawPost:unknown) {
    const validation = rawWhisperPostSchema.safeParse(rawPost);
    if (!validation.success) {
        throw new Error("Invalid post data: " + JSON.stringify(validation.error.issues));
    }

    const session = await getSession();
    if (!session) {
        throw new Error("User not authenticated");
    }
    if(session.user.banned) {
        throw new Error("User is banned");
    }
    const { content, visibility, category, poll } = validation.data;

    try {
        await dbConnect();
        const newPost = new WhisperPostModel({
            authorId: session.user.id,
            content,
            visibility,
            category,
            reactions: [],
            poll
        });
        await newPost.save();
        return Promise.resolve(newPost);
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

export async function getWhisperFeed() {
    try {
        await dbConnect();
        const posts = await WhisperPostModel.find({ })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()
        return Promise.resolve(JSON.parse(JSON.stringify(posts)));
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

export async function getWhisperPostById(postId: string):Promise<WhisperPostT> {
    if (!postId) {
        throw new Error("Invalid postId");
    }
    try {
        await dbConnect();
        const post = await WhisperPostModel.findById(postId).lean();
        if (!post) {
            throw new Error("Post not found");
        }
        return Promise.resolve(JSON.parse(JSON.stringify(post)));
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

// WhisperPostT["poll"] required
export async function updateWhisperPoll(postId: string, updatedPoll: PollT) :Promise<PollT> {
    if (!postId || !updatedPoll) {
        throw new Error("Invalid postId or poll data");
    }
    try {
        await dbConnect();
        const post = await WhisperPostModel.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }
        if(!post.poll) {
            throw new Error("No poll associated with this post");
        }
        post.poll = updatedPoll;
        await post.save();
        revalidatePath("/whisper-room/feed");
        revalidatePath("/whisper-room/feed/" + postId);
        return Promise.resolve(post.poll);
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }

}