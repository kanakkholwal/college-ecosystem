"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "~/auth";
import {
    RawCommunityPostType,
} from "~/constants/common.community";
import dbConnect from "~/lib/dbConnect";
import CommunityPost, {
    CommunityComment,
    CommunityPostTypeWithId,
    rawCommunityCommentSchema,
} from "~/models/community";

// Create a new post
export async function createPost(postData: RawCommunityPostType) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
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
type UpdateAction =
  | { type: "toggleLike" }
  | { type: "toggleSave" }
  | { type: "incrementViews" }
  | {
      type: "edit";
      data: Partial<Pick<CommunityPostTypeWithId, "title" | "content">>;
    };

export async function updatePost(id: string, action: UpdateAction) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session) throw new Error("You need to be logged in to update a post");

  await dbConnect();

  const post = await CommunityPost.findById(id);
  if (!post) throw new Error("Post not found");

  switch (action.type) {
    case "toggleLike": {
      const idx = post.likes.indexOf(session.user.id);
      if (idx === -1) {
        post.likes.push(session.user.id);
      } else {
        post.likes.splice(idx, 1);
      }
      break;
    }

    case "toggleSave": {
      const idx = post.savedBy.indexOf(session.user.id);
      if (idx === -1) {
        post.savedBy.push(session.user.id);
      } else {
        post.savedBy.splice(idx, 1);
      }
      break;
    }

    case "incrementViews": {
      post.views += 1;
      break;
    }

    case "edit": {
      if (post.author.id !== session.user.id && session.user.role !== "admin") {
        throw new Error("You are not authorized to edit this post");
      }
      Object.assign(post, action.data);
      break;
    }

    default:
      throw new Error("Unknown update action");
  }

  await post.save();

  revalidatePath(`/community/posts/${id}`);
  revalidatePath(`/community`);

  return JSON.parse(JSON.stringify(post)) as CommunityPostTypeWithId;
}
export async function deletePost(id: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
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
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
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
