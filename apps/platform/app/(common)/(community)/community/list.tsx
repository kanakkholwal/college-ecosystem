"use client";

import { UserPreview } from "@/components/application/user-preview";
import EmptyArea from "@/components/common/empty-area";
import ShareButton from "@/components/common/share-button";
import { Icon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Dot } from "lucide-react";
import Link from "next/link";
import React from "react";
import { GrAnnounce } from "react-icons/gr";
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


  if (posts.length === 0) {
    return (
      <EmptyArea
        icons={[GrAnnounce]}
        title="No community posts"
        description="There are no community posts at the moment."
      />
    );
  }



  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      {posts.map((post) => (
        <React.Fragment key={post._id}>
          <div
            key={post._id}
            className="w-full mx-auto rounded-lg backdrop-blur-md lg:p-5 bg-card border border-border p-4 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between gap-4 card-header">
              <div className="flex items-center gap-4">
                <Avatar className="size-8 rounded-full">
                  <AvatarImage
                    alt={post.author.username}
                    width={35}
                    height={25}
                    src={
                      CATEGORY_IMAGES[post.category]
                        ? CATEGORY_IMAGES[post.category]
                        : `https://api.dicebear.com/5.x/initials/svg?seed=${post.category}`
                    }
                  />
                  <AvatarFallback>
                    {post.category.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="h-10 grid grid-cols-1 -gap-1">
                  <Link
                    href={`/community?c=${post.category}`}
                    className="hover:underline hover:text-primary font-medium text-sm"
                  >
                    c/{post.category}
                  </Link>
                  <p className="flex items-center gap-1 opacity-70 text-sm">
                    <UserPreview user={post.author}>
                      <small className="hover:underline cursor-pointer">
                        @{post.author.username}
                      </small>
                    </UserPreview>
                    <Dot className="inline-block -mx-1" />
                    <small>
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </small>
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base font-medium">{post.title}</h3>
              <Badge size="sm">
                <Icon name="trend-up" />
                {formatNumber(post.views)} impressions
              </Badge>
            </div>
            <article className="max-w-full prose prose-sm dark:prose-invert text-muted-foreground pl-2 w-full rounded-lg whitespace-pre-wrap truncate">
              <Markdown>
                {post.content.slice(0, 300) +
                  (post.content.length > 300 ? "..." : "")}
              </Markdown>
            </article>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-between gap-2">
                <OptimisticFooterActionBar
                  post={post}
                  user={user}
                />
                <ShareButton
                  data={{
                    title: post.title,
                    text: "Check out this post on our community platform!",
                    url: appConfig.url + `/community/posts/${post._id}`,
                  }}
                  variant="ghost"
                  className="h-7 flex grow items-center justify-center gap-3 rounded-md px-4 py-2 transition hover:bg-accent"
                >
                  <Icon name="send" />
                  <span className="max-sm:hidden">
                    Share
                  </span>
                </ShareButton>
              </div>

              <div className="ml-auto">
                <Button variant="dark" size="sm" effect="shineHover" asChild>
                  <Link href={`/community/posts/${post._id}`}>
                    <span className="max-xs:hidden">
                      View Post
                    </span>
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          {/* {(index + 1) % 2 === 0 && (
              <AdUnit adSlot="display-square" key={`ad-${post._id}`} />
          )} */}
        </React.Fragment>
      ))}
    </div>
  );
}
