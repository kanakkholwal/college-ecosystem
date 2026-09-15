"use client";

import { cn } from "@/lib/utils";
import { Bookmark, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import toast from "react-hot-toast";
import { updatePost } from "~/actions/common.community";
import { callAction } from "~/lib/call-action";
import { formatNumber } from "~/utils/number";
import { signInHref } from "./utils";

export type PostActionsProps = {
  postId: string;
  likeCount: number;
  liked: boolean;
  saved: boolean;
  signedIn: boolean;
  /** Omit to hide the comment control (the detail page scrolls to its own thread). */
  commentHref?: string;
  commentCount?: number;
  className?: string;
};

type Reaction = { likeCount: number; liked: boolean; saved: boolean };

const actionClass =
  "inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-3 text-body font-medium text-muted-foreground outline-none transition-[background-color,color,transform] duration-150 ease-craft hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] motion-reduce:active:scale-100 [&_svg]:size-4.5 [&_svg]:shrink-0";

/** Like, comment and save. Likes and saves update instantly and roll back if the server rejects them. */
export function PostActions({
  postId,
  likeCount,
  liked,
  saved,
  signedIn,
  commentHref,
  commentCount,
  className,
}: PostActionsProps) {
  const [likePending, startLike] = useTransition();
  const [savePending, startSave] = useTransition();
  const [state, apply] = useOptimistic<Reaction, "like" | "save">(
    { likeCount, liked, saved },
    (current, action) =>
      action === "like"
        ? {
            ...current,
            liked: !current.liked,
            likeCount: Math.max(
              0,
              current.likeCount + (current.liked ? -1 : 1)
            ),
          }
        : { ...current, saved: !current.saved }
  );

  function react(action: "like" | "save") {
    const pending = action === "like" ? likePending : savePending;
    if (pending) return;
    const start = action === "like" ? startLike : startSave;
    start(async () => {
      apply(action);
      const res = await callAction(() =>
        updatePost(postId, {
          type: action === "like" ? "toggleLike" : "toggleSave",
        })
      );
      if (!res.ok) {
        toast.error(
          action === "like"
            ? "Couldn't update your like. Try again."
            : "Couldn't update your saved posts. Try again."
        );
      }
    });
  }

  const likeLabel = `${formatNumber(state.likeCount)} ${state.likeCount === 1 ? "like" : "likes"}`;
  const commentLabel =
    typeof commentCount === "number"
      ? `${formatNumber(commentCount)} ${commentCount === 1 ? "comment" : "comments"}`
      : "Comments";
  const signIn = signInHref(`/community/posts/${postId}`);

  const likeContent = (
    <>
      <Heart
        aria-hidden="true"
        className={cn(state.liked && "fill-current text-primary")}
      />
      <span className="tabular-nums">{formatNumber(state.likeCount)}</span>
    </>
  );
  const saveContent = (
    <>
      <Bookmark
        aria-hidden="true"
        className={cn(state.saved && "fill-current text-primary")}
      />
      <span className="hidden sm:inline">{state.saved ? "Saved" : "Save"}</span>
    </>
  );

  return (
    <div className={cn("relative z-10 flex items-center gap-1", className)}>
      {signedIn ? (
        <button
          type="button"
          onClick={() => react("like")}
          aria-pressed={state.liked}
          aria-label={`Like, ${likeLabel}`}
          className={cn(actionClass, state.liked && "text-foreground")}
        >
          {likeContent}
        </button>
      ) : (
        <Link
          href={signIn}
          aria-label={`Sign in to like, ${likeLabel}`}
          className={actionClass}
        >
          {likeContent}
        </Link>
      )}

      {commentHref && (
        <Link
          href={commentHref}
          aria-label={commentLabel}
          className={actionClass}
        >
          <MessageSquare aria-hidden="true" />
          <span className="tabular-nums">
            {typeof commentCount === "number"
              ? formatNumber(commentCount)
              : "Comment"}
          </span>
        </Link>
      )}

      {signedIn ? (
        <button
          type="button"
          onClick={() => react("save")}
          aria-pressed={state.saved}
          aria-label={state.saved ? "Saved. Remove from saved" : "Save post"}
          className={cn(actionClass, state.saved && "text-foreground")}
        >
          {saveContent}
        </button>
      ) : (
        <Link
          href={signIn}
          aria-label="Sign in to save this post"
          className={actionClass}
        >
          {saveContent}
        </Link>
      )}
    </div>
  );
}
