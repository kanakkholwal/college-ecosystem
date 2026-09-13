"use server";

import { eq, inArray } from "drizzle-orm";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { getSession } from "~/auth/server";
import {
  CATEGORY_TYPES,
  type RawCommunityPostType,
  rawCommunityPostSchema,
} from "~/constants/common.community";
import { db } from "~/db/connect";
import { comments, rates, users } from "~/db/schema";
import dbConnect from "~/lib/dbConnect";
import CommunityPost, {
  CommunityComment,
  type CommunityPostTypeWithId,
  type ICommunityPost,
} from "~/models/community";

const MAX_PAGE_SIZE = 50;

function normalisePost(data: Partial<RawCommunityPostType>) {
  if (data.category && data.category !== "departmental") {
    return { ...data, subCategory: null };
  }
  return data;
}

export async function createPost(postData: RawCommunityPostType) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session) {
    return Promise.reject("You need to be logged in to create a post");
  }
  // Validated here too: a server action is a public endpoint, not just the form's submit handler.
  const parsed = rawCommunityPostSchema.safeParse(postData);
  if (!parsed.success) {
    return Promise.reject(
      "Check the title, body and community, then try again"
    );
  }

  try {
    await dbConnect();
    const post = new CommunityPost({
      ...normalisePost(parsed.data),
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

export async function getPostsByCategory(
  category: string,
  page: number,
  limit: number,
  sort: "recent" | "popular" = "recent"
): Promise<CommunityPostTypeWithId[]> {
  const isAll = category === "all";
  if (!isAll && !(CATEGORY_TYPES as readonly string[]).includes(category)) {
    return [];
  }
  const safePage = Math.max(1, Math.floor(Number(page)) || 1);
  const safeLimit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(Number(limit)) || 10)
  );

  try {
    await dbConnect();
    const posts = await CommunityPost.find(isAll ? {} : { category })
      .select("-content_json")
      .sort(
        sort === "popular" ? { views: -1, createdAt: -1 } : { createdAt: -1 }
      )
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean();
    return JSON.parse(JSON.stringify(posts));
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch posts");
  }
}

/** Reads one post. `cached: false` also counts a view. Returns null for unknown or malformed ids. */
export async function getPostById(
  id: string,
  cached: boolean
): Promise<CommunityPostTypeWithId | null> {
  if (!mongoose.isObjectIdOrHexString(id)) return null;
  try {
    await dbConnect();
    const post = cached
      ? await CommunityPost.findById(id).lean()
      : await CommunityPost.findByIdAndUpdate(
          id,
          { $inc: { views: 1 } },
          { returnDocument: "after", timestamps: false }
        ).lean();
    return post ? JSON.parse(JSON.stringify(post)) : null;
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch post");
  }
}

type EditablePostFields = Partial<
  Pick<
    CommunityPostTypeWithId,
    "title" | "content" | "content_json" | "category" | "subCategory"
  >
>;

type UpdateAction =
  | { type: "toggleLike" }
  | { type: "toggleSave" }
  | { type: "edit"; data: EditablePostFields };

export async function updatePost(id: string, action: UpdateAction) {
  const session = await getSession();
  if (!session) throw new Error("You need to be logged in to update a post");
  if (!mongoose.isObjectIdOrHexString(id)) throw new Error("Post not found");

  await dbConnect();

  const post = await CommunityPost.findById(id);
  if (!post) throw new Error("Post not found");

  let updated: unknown;
  switch (action.type) {
    case "toggleLike":
    case "toggleSave": {
      const field = action.type === "toggleLike" ? "likes" : "savedBy";
      const has = (post[field] as string[]).includes(session.user.id);
      // Atomic operators so concurrent reactions don't overwrite each other's array writes.
      updated = await CommunityPost.findByIdAndUpdate(
        id,
        has
          ? { $pull: { [field]: session.user.id } }
          : { $addToSet: { [field]: session.user.id } },
        { returnDocument: "after", timestamps: false }
      ).lean();
      break;
    }

    case "edit": {
      if (post.author.id !== session.user.id && session.user.role !== "admin") {
        throw new Error("You are not authorized to edit this post");
      }
      // Schema parse strips unknown keys, so callers can't overwrite author, likes or views.
      const parsed = rawCommunityPostSchema.partial().safeParse(action.data);
      if (!parsed.success) throw new Error("Invalid post data");
      post.set(normalisePost(parsed.data));
      await post.save();
      updated = post.toObject();
      break;
    }

    default:
      throw new Error("Unknown update action");
  }

  revalidatePath(`/community/posts/${id}`);
  revalidatePath(`/community`);

  return JSON.parse(JSON.stringify(updated)) as CommunityPostTypeWithId;
}

export async function deletePost(id: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (!session) {
    return Promise.reject("You need to be logged in to update a post");
  }
  if (!mongoose.isObjectIdOrHexString(id))
    return Promise.reject("Post not found");

  try {
    await dbConnect();
    const post = await CommunityPost.findById(id);
    if (!post) {
      return Promise.reject("Post not found");
    }

    if (post.author.id !== session.user.id && session.user.role !== "admin") {
      return Promise.reject("You are not authorized to delete this post");
    }
    await post.deleteOne();
    await CommunityComment.deleteMany({ postId: id });
    // Live comments are Fuma threads in Postgres, keyed by page id.
    const page = `community.posts.${id}`;
    const thread = await db
      .select({ id: comments.id })
      .from(comments)
      .where(eq(comments.page, page));
    if (thread.length > 0) {
      await db.delete(rates).where(
        inArray(
          rates.commentId,
          thread.map((c) => c.id)
        )
      );
      await db.delete(comments).where(eq(comments.page, page));
    }
    revalidatePath(`/community`);
    revalidatePath(`/community/posts/${id}`);
    return Promise.resolve("Post deleted successfully");
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to delete post");
  }
}

export async function getPostActivity(id: string) {
  try {
    await dbConnect();
    const post = await CommunityPost.findById<ICommunityPost>(id);
    if (!post) {
      return Promise.reject("Post not found");
    }

    const likedBy =
      post.likes.length === 0
        ? []
        : await db
            .select({
              id: users.id,
              name: users.name,
              username: users.username,
              image: users.image,
            })
            .from(users)
            .where(inArray(users.id, post.likes));

    const savedBy =
      post.savedBy.length === 0
        ? []
        : await db
            .select({
              id: users.id,
              name: users.name,
              username: users.username,
              image: users.image,
            })
            .from(users)
            .where(inArray(users.id, post.savedBy));
    return Promise.resolve({
      likedBy,
      savedBy,
    });
  } catch (err) {
    console.error(err);
    return Promise.reject("Failed to fetch post stats");
  }
}
