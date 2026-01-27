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
import AdUnit from "@/components/common/adsense";
import ShareButton from "@/components/common/share-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ButtonLink } from "@/components/utils/link";
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Eye,
  MessageSquare,
  MessageSquareText,
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
    <div className="min-h-screen pb-20">

      {/* JSON-LD Schema */}
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

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/community?c=${post.category}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="p-1.5 rounded-full bg-muted group-hover:bg-muted/80">
              <ArrowLeft className="size-4" />
            </div>
            <span className="font-medium">Back to c/{post.category}</span>
          </Link>

          {isAuthor && (
            <ButtonLink variant="ghost" size="sm" href={`/community/edit?postId=${post._id}`}>
              <Edit3 className="size-4 mr-2" /> Edit Post
            </ButtonLink>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 space-y-5">



          <main className="lg:col-span-11 bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">

            {/* Post Header */}
            <div className="p-6 md:p-8 border-b border-border/40 bg-muted/10">
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="size-10 border border-border/50">
                  <AvatarImage src={CATEGORY_IMAGES[post.category] || `https://api.dicebear.com/5.x/initials/svg?seed=${post.category}`} />
                  <AvatarFallback>{post.category.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-sm">
                    <Link href={`/community?c=${post.category}`} className="font-bold hover:underline">
                      c/{post.category}
                    </Link>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground text-xs">
                      Posted by <Link href={`/u/${post.author.username}`} className="hover:text-foreground">u/{post.author.username}</Link>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4">
                {post.title}
              </h1>

              <div className="flex items-center gap-3">
                <Badge variant="default_soft">
                  <Eye className="size-3.5 text-muted-foreground" />
                  {formatNumber(post.views)} views
                </Badge>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="p-6 md:p-8">
              <article className="prose prose-zinc dark:prose-invert max-w-none 
                    prose-headings:font-semibold 
                    prose-p:leading-relaxed prose-p:text-muted-foreground/90
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-xl prose-img:shadow-sm"
              >
                <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
              </article>
            </div>

            {/* Footer Actions */}
            <div className="bg-muted/10 border-t border-border/40 px-6 md:px-8 py-4">
              <PostFooter post={post} user={session?.user!} />
            </div>

          </main>
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center gap-6 sticky top-24 h-fit">
            <div className="flex flex-col gap-2 p-1 rounded-full bg-muted/30 border border-border/50">
              <ShareButton
                data={{
                  title: post.title,
                  text: "Check out this discussion!",
                  url: `${appConfig.url}/community/posts/${post._id}`,
                }}
                variant="ghost" size="icon" className="rounded-full hover:bg-muted" title="Share">
                <Share2 className="size-5 text-muted-foreground" />
              </ShareButton>
              <Separator className="w-6 mx-auto bg-border/50" />
              <ButtonLink variant="ghost" size="icon" className="rounded-full hover:bg-muted" title="Comment" href="#comments">
                <MessageSquare className="size-5 text-muted-foreground" />
              </ButtonLink>
            </div>
          </div>
        </div>
        <section className="mt-16 max-w-4xl mx-auto space-y-6" id="comments">

          <div className="flex flex-col gap-1 pb-4 border-b border-border/40 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                Join the Discussion
              </h3>
            </div>
            <p className="text-muted-foreground text-base ml-13">
              Share your thoughts on <span className="text-foreground font-medium">{`"${post.title}"`}</span>
            </p>
          </div>

          <CommentSection
            page={`community.posts.${post._id}`}
            sessionId={session?.session.id}
            className="w-full border-none p-4 md:p-6 bg-card"
          />

        </section>

        <div className="mt-8 max-w-4xl mx-auto space-y-8">
          <AdUnit adSlot="display-horizontal" key="community-post-ad" />

          <div id="comments" className="scroll-mt-20">
            {/* <CommentsWithAuth page={`community/posts/${post._id}`} /> */}
          </div>
        </div>

      </div>
    </div>
  );
}