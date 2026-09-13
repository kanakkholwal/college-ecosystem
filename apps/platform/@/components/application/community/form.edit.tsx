"use client";

import type { CommunityPostTypeWithId } from "~/models/community";
import { PostForm } from "./post-form";

type EditablePost = Pick<
  CommunityPostTypeWithId,
  "title" | "content" | "content_json" | "category" | "subCategory"
>;

export default function EditPostForm({
  postId,
  post,
}: {
  postId: string;
  post: EditablePost;
}) {
  return (
    <PostForm
      mode="edit"
      postId={postId}
      defaultValues={{
        title: post.title,
        content: post.content,
        // Older posts have no editor JSON; seeding with the markdown keeps the body instead of an empty editor.
        content_json: post.content_json ?? post.content,
        category: post.category,
        subCategory: post.subCategory,
      }}
    />
  );
}
