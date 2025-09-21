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
            if (existingReaction.type !== reaction) {
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

export async function createWhisperPost(rawPost: unknown): Promise<boolean> {
    const validation = rawWhisperPostSchema.safeParse(rawPost);
    if (!validation.success) {
        throw new Error("Invalid post data: " + JSON.stringify(validation.error.issues));
    }
    const session = await getSession();
    if (!session) {
        throw new Error("User not authenticated");
    }
    if (session.user.banned) {
        throw new Error("User is banned");
    }
    const { content_json, visibility, category, poll, pseudo } = validation.data;

    try {
        await dbConnect();
        // Do NOT instantiate Mongoose document, just create it directly
        await WhisperPostModel.create({
            authorId: session.user.id,
            content_json: JSON.parse(JSON.stringify(content_json)),
            visibility,
            category,
            reactions: [],
            poll,
            pseudo,
        });

        revalidatePath("/whisper-room/feed");
        return Promise.resolve(true);
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

export async function getWhisperFeed(): Promise<WhisperPostT[]> {
    try {
        await dbConnect();
        const posts = await WhisperPostModel.find({})
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()
        return Promise.resolve(JSON.parse(JSON.stringify(posts)));
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

export async function getWhisperPostById(postId: string): Promise<WhisperPostT> {
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
export async function updateWhisperPoll(postId: string, updatedPoll: PollT): Promise<PollT> {
    if (!postId || !updatedPoll) {
        throw new Error("Invalid postId or poll data");
    }
    try {
        await dbConnect();
        const post = await WhisperPostModel.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }
        if (!post.poll) {
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

export async function deleteWhisperPost(postId: string): Promise<boolean> {
    if (!postId) {
        throw new Error("Invalid postId");
    }
    const session = await getSession();
    if (!session) {
        throw new Error("User not authenticated");
    }
    try {
        await dbConnect();
        const post = await WhisperPostModel.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }
        if (post.authorId !== session.user.id && session.user.role !== "admin") {
            throw new Error("User not authorized to delete this post");
        }
        await post.deleteOne();
        revalidatePath("/whisper-room/feed");
        return Promise.resolve(true);
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}
export async function editWhisperPost(postId: string, rawPost: unknown): Promise<WhisperPostT> {
    if (!postId) {
        throw new Error("Invalid postId");
    }
    const validation = rawWhisperPostSchema.safeParse(rawPost);
    if (!validation.success) {
        throw new Error("Invalid post data: " + JSON.stringify(validation.error.issues));
    }
    const session = await getSession();
    if (!session) {
        throw new Error("User not authenticated");
    }
    try {
        await dbConnect();
        const post = await WhisperPostModel.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }
        if (post.authorId !== session.user.id && session.user.role !== "admin") {
            throw new Error("User not authorized to edit this post");
        }
        const { content_json, visibility, category, poll, pseudo } = validation.data;
        post.content_json = content_json;
        post.visibility = visibility;
        post.category = category;
        post.poll = poll;
        post.pseudo = pseudo;
        await post.save();
        revalidatePath("/whisper-room/feed");
        revalidatePath("/whisper-room/feed/" + postId);
        return Promise.resolve(JSON.parse(JSON.stringify(post)));
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}

type patchMethod = Partial<WhisperPostT>;

export async function patchWhisperPost(postId: string, patch: patchMethod, payload: Partial<WhisperPostT>): Promise<WhisperPostT> {
    if (!postId) {
        throw new Error("Invalid postId");
    }
    try {
        await dbConnect();
        const post = await WhisperPostModel.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }
        Object.assign(post, patch);
        await post.save();
        revalidatePath("/whisper-room/feed");
        revalidatePath("/whisper-room/feed/" + postId);
        return Promise.resolve(JSON.parse(JSON.stringify(post)));
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
}
