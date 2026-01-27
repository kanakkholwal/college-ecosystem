import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostById } from "src/actions/common.community";
import { auth } from "~/auth";
import { CATEGORY_IMAGES } from "~/constants/common.community";
import PostFooter from "./post-footer";

import { CommentSection } from "@/components/application/comments";
import { CommunityPostStats } from "@/components/application/community.posts.stats";
import AdUnit from "@/components/common/adsense";
import ShareButton from "@/components/common/share-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ButtonLink } from "@/components/utils/link";
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Eye,
  MessageCircle,
  MessageSquare,
  Share2
} from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { appConfig } from "~/project.config";
import { getBaseURL } from "~/utils/env";
import { formatNumber } from "~/utils/number";

interface Props {
  params: Promise<{
    postId: string;
  }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { postId } = await params;
  const post = await getPostById(postId, true);
  if (!post) return notFound();

  return {
    title: `${post.title}`,
    description: post.content.slice(0, 100),
    openGraph: {
      images: [`${getBaseURL()}/${CATEGORY_IMAGES[post.category]}`],
    },
  };
}

const viewCache = new Set<string>();

export default async function CommunityPost(props: Props) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const params = await props.params;

  const post = await getPostById(params.postId, viewCache.has(params.postId));
  if (!post) return notFound();

  if (post) viewCache.add(params.postId);

  const isAuthor = session?.user?.id === post.author.id || session?.user?.role === "admin";

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DiscussionForumPosting",
            headline: post.title,
            description: post.content.slice(0, 100),
            author: { "@type": "Person", name: post.author.name },
            datePublished: post.createdAt,
            about: post.category,
            image: `${appConfig.url}/${CATEGORY_IMAGES[post.category]}`,
          }),
        }}
        id="json-ld-blog-post"
      />

      <div className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60 rounded-lg">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex h-14 items-center justify-between">
            <Link
              href={`/community?c=${post.category}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>c/{post.category}</span>
            </Link>

            <div className="flex items-center gap-2">
              <ShareButton
                data={{
                  title: post.title,
                  text: "Check out this discussion!",
                  url: `${appConfig.url}/community/posts/${post._id}`,
                }}
                variant="ghost"
                size="sm"
                className="inline-flex lg:hidden"
              >
                <Share2 />
                Share
              </ShareButton>

              {isAuthor && (
                <ButtonLink
                  variant="ghost"
                  size="sm"
                  href={`/community/edit?postId=${post._id}`}
                  className="text-muted-foreground"
                >
                  <Edit3 />
                  Edit
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_64px] gap-6 lg:gap-8">
          {/* Main Content */}
          <main className="min-w-0">
            {/* Post Header */}
            <div className="mb-6 space-y-4">
              {/* Category & Author Info */}
              <div className="flex items-start gap-3">
                <Link
                  href={`/community?c=${post.category}`}
                  className="group shrink-0"
                >
                  <Avatar className="size-10 ring-1 ring-border transition-all group-hover:ring-2 group-hover:ring-primary/50">
                    <AvatarImage
                      src={
                        CATEGORY_IMAGES[post.category] ||
                        `https://api.dicebear.com/5.x/initials/svg?seed=${post.category}`
                      }
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                      {post.category.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Link
                      href={`/community?c=${post.category}`}
                      className="font-semibold text-foreground hover:underline decoration-2 underline-offset-2"
                    >
                      c/{post.category}
                    </Link>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      Posted by{" "}
                      <Link
                        href={`/u/${post.author.username}`}
                        className="hover:text-foreground transition-colors"
                      >
                        u/{post.author.username}
                      </Link>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <time dateTime={post.createdAt?.toString()}>
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </time>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex items-center gap-3 pt-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  <Eye className="size-3.5" />
                  <span>{formatNumber(post.views)}</span>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Post Content */}
            <article
              className="prose prose-zinc dark:prose-invert max-w-none
                prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h1:font-bold
                prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-[15px] prose-p:leading-7 prose-p:text-foreground/90
                prose-a:font-medium prose-a:text-primary prose-a:no-underline prose-a:decoration-primary/30 prose-a:decoration-2 prose-a:underline-offset-2
                hover:prose-a:underline hover:prose-a:decoration-primary
                prose-strong:font-semibold prose-strong:text-foreground
                prose-code:text-sm prose-code:font-medium prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg
                prose-img:rounded-xl prose-img:border prose-img:border-border prose-img:shadow-sm
                prose-blockquote:border-l-primary prose-blockquote:border-l-2 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                prose-ul:my-4 prose-ol:my-4
                prose-li:my-1 prose-li:text-foreground/90"
            >
              <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
            </article>

            {/* Post Footer Actions */}
            <div className="mt-8 pt-6 border-t">
              <PostFooter post={post} user={session?.user!}>

                {session?.user?.role === "admin" && (<CommunityPostStats postId={post._id} />)}
              </PostFooter>
            </div>

            {/* Comments Section */}
            <section className="mt-12 pt-8 border-t" id="comments">
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
                    <MessageCircle className="size-5" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Discussion
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground ml-[52px]">
                  Share your thoughts about{" "}
                  <span className="text-foreground font-medium">
                    "{post.title}"
                  </span>
                </p>
              </div>

              <CommentSection
                page={`community.posts.${post._id}`}
                sessionId={session?.session.id}
                className="w-full"
              />
            </section>

            {/* Ad Unit */}
            <div className="mt-12">
              <AdUnit adSlot="display-horizontal" key="community-post-ad" />
            </div>
          </main>

          {/* Sidebar Actions - Desktop Only */}
          <aside className="hidden lg:block">
            <div className="sticky top-[72px] flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon_lg"
                asChild
              >
                <a href="#comments" title="Comments">
                  <MessageSquare />
                </a>
              </Button>

              <Separator className="my-1" />

              <ShareButton
                data={{
                  title: post.title,
                  text: "Check out this discussion!",
                  url: `${appConfig.url}/community/posts/${post._id}`,
                }}
                variant="ghost"
                size="icon_lg"
                title="Share"
              >
                <Share2 />
              </ShareButton>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}