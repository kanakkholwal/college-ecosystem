"use server";

import { ROLES_ENUMS } from "~/constants";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentSession } from "~/auth/guards";
import { getSession } from "~/auth/server";
import {
  CATEGORY_TYPES,
  type RawCommunityPostType,
  rawCommunityPostSchema,
} from "~/constants/common.community";
import { isObjectIdString } from "~/constants/hostel_n_outpass";
import { db } from "~/db/connect";
import { comments, rates, users } from "~/db/schema";
import {
  type ActionResult,
  runAction,
  UserFacingError,
} from "~/lib/action-result";
import dbConnect from "~/lib/dbConnect";
import CommunityPost, {
  CommunityComment,
  type CommunityPostTypeWithId,
  type ICommunityPost,
} from "~/models/community";
import { serialize } from "~/utils/serialize";

const MAX_PAGE_SIZE = 50;
const POST_NOT_FOUND = "Post not found";

function normalisePost(data: Partial<RawCommunityPostType>) {
  if (data.category && data.category !== "departmental") {
    return { ...data, subCategory: null };
  }
  return data;
}

export async function createPost(
  postData: RawCommunityPostType
): Promise<ActionResult<string>> {
  return runAction("Failed to create post", async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UserFacingError("You need to be logged in to create a post");
    }
    // Validated here too: a server action is a public endpoint, not just the form's submit handler.
    const parsed = rawCommunityPostSchema.safeParse(postData);
    if (!parsed.success) {
      throw new UserFacingError(
        "Check the title, body and community, then try again"
      );
    }

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
    return "Post created successfully";
  });
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
    return serialize<CommunityPostTypeWithId[]>(posts);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch posts");
  }
}

/** Reads one post. `cached: false` also counts a view. Returns null for unknown or malformed ids. */
export async function getPostById(
  id: string,
  cached: boolean
): Promise<CommunityPostTypeWithId | null> {
  if (!isObjectIdString(id)) return null;
  try {
    await dbConnect();
    const post = cached
      ? await CommunityPost.findById(id).lean()
      : await CommunityPost.findByIdAndUpdate(
          id,
          { $inc: { views: 1 } },
          { returnDocument: "after", timestamps: false }
        ).lean();
    return post ? serialize<CommunityPostTypeWithId>(post) : null;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch post");
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

export async function updatePost(
  id: string,
  action: UpdateAction
): Promise<ActionResult<CommunityPostTypeWithId>> {
  return runAction("Couldn't update the post. Try again.", async () => {
    const session = await getSession();
    if (!session) {
      throw new UserFacingError("You need to be logged in to update a post");
    }
    if (!isObjectIdString(id)) throw new UserFacingError(POST_NOT_FOUND);

    await dbConnect();

    const post = await CommunityPost.findById(id);
    if (!post) throw new UserFacingError(POST_NOT_FOUND);

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
        if (
          post.author.id !== session.user.id &&
          session.user.role !== ROLES_ENUMS.ADMIN
        ) {
          throw new UserFacingError("You are not authorized to edit this post");
        }
        // Schema parse strips unknown keys, so callers can't overwrite author, likes or views.
        const parsed = rawCommunityPostSchema.partial().safeParse(action.data);
        if (!parsed.success) throw new UserFacingError("Invalid post data");
        post.set(normalisePost(parsed.data));
        await post.save();
        updated = post.toObject();
        break;
      }

      default:
        throw new UserFacingError("Unknown update action");
    }

    revalidatePath(`/community/posts/${id}`);
    revalidatePath(`/community`);

    return serialize<CommunityPostTypeWithId>(updated);
  });
}

export async function deletePost(id: string): Promise<ActionResult<string>> {
  return runAction("Failed to delete post", async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw new UserFacingError("You need to be logged in to update a post");
    }
    if (!isObjectIdString(id)) throw new UserFacingError(POST_NOT_FOUND);

    await dbConnect();
    const post = await CommunityPost.findById(id);
    if (!post) throw new UserFacingError(POST_NOT_FOUND);

    if (
      post.author.id !== session.user.id &&
      session.user.role !== ROLES_ENUMS.ADMIN
    ) {
      throw new UserFacingError("You are not authorized to delete this post");
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
    return "Post deleted successfully";
  });
}

type ActivityUser = {
  id: string;
  name: string;
  username: string;
  image: string | null;
};

export async function getPostActivity(
  id: string
): Promise<ActionResult<{ likedBy: ActivityUser[]; savedBy: ActivityUser[] }>> {
  return runAction("Failed to fetch post stats", async () => {
    const session = await getCurrentSession();
    if (!session) throw new UserFacingError("Sign in to see post activity");
    if (!isObjectIdString(id)) throw new UserFacingError(POST_NOT_FOUND);
    await dbConnect();
    const post = await CommunityPost.findById<ICommunityPost>(id);
    if (!post) throw new UserFacingError(POST_NOT_FOUND);
    // Bookmarks are private: only the author and admins see who saved a post.
    const canSeeSaves =
      post.author.id === session.user.id ||
      session.user.role === ROLES_ENUMS.ADMIN;

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
      !canSeeSaves || post.savedBy.length === 0
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
    return { likedBy, savedBy };
  });
}
