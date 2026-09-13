"use client";

import type { CATEGORY_TYPES } from "~/constants/common.community";
import { PostForm } from "./post-form";

export default function CreateCommunityPost({
  defaultCategory,
  defaultTitle,
}: {
  defaultCategory?: (typeof CATEGORY_TYPES)[number];
  defaultTitle?: string;
} = {}) {
  return (
    <PostForm
      mode="create"
      defaultValues={{ category: defaultCategory, title: defaultTitle }}
    />
  );
}
