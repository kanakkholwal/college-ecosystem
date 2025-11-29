"use client";

import { UserPreview } from "@/components/application/user-preview";
import EmptyArea from "@/components/common/empty-area";
import ShareButton from "@/components/common/share-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { BarChart2, MessageSquare, MessageSquareText, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import type { CommunityPostTypeWithId } from "src/models/community";
import type { Session } from "~/auth";
import { CATEGORY_IMAGES } from "~/constants/common.community";
import { appConfig } from "~/project.config";
import { formatNumber } from "~/utils/number";
import { OptimisticFooterActionBar } from "./posts/[postId]/post-footer";

export default function CommunityPostList({
  posts,
  user,
}: {
  posts: CommunityPostTypeWithId[];
  user?: Session["user"];
}) {
  const router = useRouter();

  if (posts.length === 0) {
    return (
      <div className="py-20 border border-dashed rounded-xl bg-muted/20">
        <EmptyArea
          icons={[MessageSquareText]}
          title="No Discussions Yet"
          description="Be the first to start a conversation in this community."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {posts.map((post) => (
        <article
          key={post._id}
          className="group relative flex flex-col gap-3 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm"
        >
          {/* --- Header: Meta Info --- */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/community?c=${post.category}`} className="shrink-0 z-20">
                <Avatar className="size-8 rounded-lg border border-border/50">
                  <AvatarImage
                    src={CATEGORY_IMAGES[post.category] || `https://api.dicebear.com/5.x/initials/svg?seed=${post.category}`}
                    alt={post.category}
                  />
                  <AvatarFallback className="rounded-lg text-xs">
                    {post.category.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex flex-col text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <Link href={`/community?c=${post.category}`} className="hover:underline text-foreground z-20">
                    c/{post.category}
                  </Link>
                  <span className="text-muted-foreground">•</span>
                  <UserPreview user={post.author}>
                    <span className="text-muted-foreground hover:text-foreground cursor-pointer z-20">
                      @{post.author.username}
                    </span>
                  </UserPreview>
                </div>
                <span className="text-muted-foreground/60">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          <div
            onClick={() => router.push(`/community/posts/${post._id}`)}
            className="cursor-pointer space-y-2 z-10"
          >
            <h3 className="text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
              {post.title}
            </h3>

            <div className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed prose-p:my-0 prose-headings:text-sm">
              <Markdown
                components={{
                  // Strip images/headings for preview to keep it clean
                  img: () => null,
                  h1: ({ children }) => <p className="font-bold">{children}</p>,
                  h2: ({ children }) => <p className="font-bold">{children}</p>,
                }}
              >
                {post.content}
              </Markdown>
            </div>
          </div>

          {/* --- Footer: Stats & Actions --- */}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/40 z-20">

            {/* Left: Interactive Buttons */}
            <div className="flex items-center gap-4">
              <OptimisticFooterActionBar post={post} user={user} className="h-8" />

              <Link
                href={`/community/posts/${post._id}#comments`}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2 py-1 rounded-full transition-colors"
              >
                <MessageSquare className="size-3.5" />
                <span className="hidden sm:inline">Comments</span>
              </Link>
            </div>

            {/* Right: View Count & Share */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5" title={`${post.views} Views`}>
                <BarChart2 className="size-3.5" />
                <span className="font-medium tabular-nums">{formatNumber(post.views)}</span>
              </div>

              <ShareButton
                data={{
                  title: post.title,
                  text: "Check out this discussion",
                  url: appConfig.url + `/community/posts/${post._id}`,
                }}
                variant="ghost"
                size="icon"
                className="size-7 rounded-full hover:bg-muted"
              >
                <Share2 className="size-3.5" />
              </ShareButton>
            </div>
          </div>

        </article>
      ))}
    </div>
  );
}