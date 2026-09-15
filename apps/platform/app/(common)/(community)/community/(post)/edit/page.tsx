import EditPostForm from "@/components/application/community/form.edit";
import {
  canManagePost,
  signInHref,
} from "@/components/application/community/utils";
import { TiltedChip } from "@/components/site/sections";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPostById } from "~/actions/common.community";
import { getSessionOrThrow } from "~/auth/server";

interface Props {
  searchParams: Promise<{
    postId?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit post",
  description: "Edit a post in the community",
  robots: { index: false },
};

export default async function CommunityPostEditPage(props: Props) {
  const { postId } = await props.searchParams;
  if (!postId) notFound();

  const [post, session] = await Promise.all([
    getPostById(postId, true),
    getSessionOrThrow(),
  ]);
  if (!session) {
    redirect(
      signInHref(`/community/edit?postId=${encodeURIComponent(postId)}`)
    );
  }
  if (!post) notFound();

  if (!canManagePost(session.user, post)) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start py-16">
        <TiltedChip>Not allowed</TiltedChip>
        <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
          Only the author
          <br />
          <span className="text-primary">can edit this post</span>
        </h1>
        <p className="mt-3 text-pretty text-body text-muted-foreground md:text-body-lg">
          You can still read it and join the discussion in the comments.
        </p>
        <ButtonLink
          href={`/community/posts/${post._id}`}
          variant="primary"
          className="mt-6"
        >
          <ArrowLeft />
          Back to the post
        </ButtonLink>
      </div>
    );
  }

  return (
    <EditPostForm
      postId={post._id}
      post={{
        title: post.title,
        content: post.content,
        content_json: post.content_json,
        category: post.category,
        subCategory: post.subCategory,
      }}
    />
  );
}
