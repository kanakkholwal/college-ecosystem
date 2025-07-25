"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "~/auth/server";
import dbConnect from "~/lib/dbConnect";
import CommunityPost, {
    CommunityComment,
    CommunityPostTypeWithId,
    rawCommunityCommentSchema,
    RawCommunityPostType,
} from "~/models/community";

// Create a new post
export async function createPost(postData: RawCommunityPostType) {
  const session = await getSession();
  if (!session) {
    return Promise.reject("You need to be logged in to create a post");
  }

  try {
    await dbConnect();
    const post = new CommunityPost({
      ...postData,
      author: {
        id: session.user.id,
        name: session.user.name,
        username: session.user.username,
      },
      views: 0,
      likes: [],
      savedBy: [],
    });
    await post.save();
    revalidatePath(`/community`);
    return Promise.resolve("Post created successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to create post");
  }
}

// Get posts by category and pagination
export async function getPostsByCategory(
  category: string,
  page: number,
  limit: number
): Promise<CommunityPostTypeWithId[]> {
  try {
    await dbConnect();
    const posts = await CommunityPost.find({
      category: category === "all" ? { $exists: true } : category,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name email rollNo");
    return Promise.resolve(JSON.parse(JSON.stringify(posts)));
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch posts");
  }
}

// Get a single post by ID
export async function getPostById(
  id: string,
  cached: boolean
): Promise<CommunityPostTypeWithId | null> {
  try {
    await dbConnect();
    const postExists = await CommunityPost.findById(id);
    if (!postExists) {
      return Promise.resolve(null);
    }
    const post = await CommunityPost.findById(id).populate(
      "author",
      "name email rollNo"
    );
    if (!cached) {
      post.views += 1;
      await post.save();
    }
    return Promise.resolve(JSON.parse(JSON.stringify(post)));
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch post");
  }
}

// Update post (likes, saves, views)
export async function updatePost(
  id: string,
  updates: Partial<CommunityPostTypeWithId>
) {
  const session = await getSession();
  if (!session) {
    return Promise.reject("You need to be logged in to update a post");
  }

  try {
    await dbConnect();
    const post = await CommunityPost.findById(id);
    if (!post) {
      return Promise.reject("Post not found");
    }

    // Check if the user is the author of the post
    if (
      ("title" in updates || "content" in updates) &&
      (post.author.id !== session.user.id || session.user.role !== "admin")
    ) {
      return Promise.reject("You are not authorized to update this post");
    }

    Object.assign(post, updates);
    await post.save();
    revalidatePath(`/community/posts/${id}`);
    return Promise.resolve(JSON.parse(JSON.stringify(post)));
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to update post");
  }
}
export async function deletePost(
  id: string,
) {
  const session = await getSession();
  if (!session) {
    return Promise.reject("You need to be logged in to update a post");
  }

  try {
    await dbConnect();
    const post = await CommunityPost.findById(id);
    if (!post) {
      return Promise.reject("Post not found");
    }

    // Check if the user is the author of the post
    if (post.author.id !== session.user.id && session.user.role !== "admin") {
      return Promise.reject("You are not authorized to delete this post");
    }
    await post.deleteOne();
    // Also delete all comments related to this post
    await CommunityComment.deleteMany({ postId: id });
    revalidatePath(`/community`);
    return Promise.resolve("Post deleted successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to delete post");
  }
}

// Create a new comment
export async function createComment(
  commentData: z.infer<typeof rawCommunityCommentSchema>
) {
  const session = await getSession();
  if (!session) {
    return Promise.reject("You need to be logged in to create a comment");
  }

  try {
    await dbConnect();
    const comment = new CommunityComment({
      ...commentData,
      author: session.user.id,
    });
    await comment.save();
    revalidatePath(`/community/posts/${commentData.postId}`);
    return Promise.resolve("Comment created successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to create comment");
  }
}

// Get comments for a post (with pagination or lazy loading)
export async function getCommentsForPost(
  postId: string,
  page: number,
  limit: number
) {
  try {
    await dbConnect();
    const comments = await CommunityComment.find({ postId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("replies")
      .populate("author", "name email");
    return Promise.resolve(JSON.parse(JSON.stringify(comments)));
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch comments");
  }
}
