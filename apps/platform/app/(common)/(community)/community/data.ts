import { commentsPageId } from "@/components/application/community/utils";
import { count, inArray } from "drizzle-orm";
import { db } from "~/db/connect";
import { isObjectIdString } from "~/constants/hostel_n_outpass";
import { comments } from "~/db/schema";
import dbConnect from "~/lib/dbConnect";
import CommunityPost from "~/models/community";

/** Comment totals keyed by post id. Missing keys mean the count could not be read, not zero. */
export async function getCommentCounts(
  postIds: string[]
): Promise<Record<string, number>> {
  if (postIds.length === 0) return {};
  try {
    const pages = postIds.map(commentsPageId);
    const rows = await db
      .select({ page: comments.page, total: count() })
      .from(comments)
      .where(inArray(comments.page, pages))
      .groupBy(comments.page);
    const byPage = new Map(rows.map((r) => [r.page, r.total]));
    return Object.fromEntries(
      postIds.map((id) => [id, byPage.get(commentsPageId(id)) ?? 0])
    );
  } catch (err) {
    console.error("[community] comment counts failed", err);
    return {};
  }
}

export async function recordPostView(postId: string) {
  if (!isObjectIdString(postId)) return;
  try {
    await dbConnect();
    await CommunityPost.updateOne(
      { _id: postId },
      { $inc: { views: 1 } },
      { timestamps: false }
    );
  } catch (err) {
    console.error("[community] view count failed", err);
  }
}
