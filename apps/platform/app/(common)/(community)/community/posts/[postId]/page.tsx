import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostById } from "src/actions/common.community";
import { getSession } from "~/auth/server";
import { CATEGORY_IMAGES } from "~/constants/common.community";
import PostFooter from "./post-footer";

interface Props {
  params: Promise<{
    postId: string;
  }>;
}

// import { CommentsWithAuth } from "@/components/application/comments";
import AdUnit from "@/components/common/adsense";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dot, Edit } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { appConfig } from "~/project.config";
import { formatNumber } from "~/utils/number";

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const { postId } = await params;
  const post = await getPostById(postId, true);
  if (!post) return notFound();

  return {
    title: `${post.title} `,
    description: post.content.slice(0, 100),
    openGraph: {
      images: [`${process.env.BASE_URL}/${CATEGORY_IMAGES[post.category]}`],
    },
  };
}

const viewCache = new Set<string>();

export default async function CommunityPost(props: Props) {
  const session = await getSession();
  const params = await props.params;
  const post = await getPostById(params.postId, viewCache.has(params.postId));

  if (!post) return notFound();
  if (post) {
    viewCache.add(params.postId);
  }
  // console.log(post);
  const isAuthor =
    session?.user?.id === post.author.id || session?.user?.role === "admin";

  return (
    <main className="md:col-span-3 space-y-4 pr-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DiscussionForumPosting",
            headline: post.title,
            description: post.content.slice(0, 100),
            author: {
              "@type": "Person",
              name: post.author.name,
            },
            datePublished: post.createdAt,
            about: post.category,
            image: `${appConfig.url}/${CATEGORY_IMAGES[post.category]}`,
          }),
        }}
        id="json-ld-blog-post"
      />
      <div className="w-full mx-auto rounded-lg bg-card backdrop-blur-md p-3 lg:p-5 grid grid-cols-1 gap-y-4">
        <div className="inline-flex items-center gap-2">
          <Avatar className="size-10 rounded-full">
            <AvatarImage
              alt={post.author.username}
              width={32}
              height={32}
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
          <p className="text-xs text-muted-foreground align-middle">
            <Link
              href={`/community?c=${post.category}`}
              className="hover:underline hover:text-primary font-medium"
            >
              c/{post.category}
            </Link>
            <Dot className="inline-block -mx-1" />
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
            <br className="block" />
            <Link
              href={`/u/${post.author.username}`}
              className="text-primary hover:underline -mt-1"
            >
              @{post.author.username}
            </Link>
          </p>
          {isAuthor && (
            <Button variant="ghost" size="xs" className="ml-auto" asChild>
              <Link href={`/community/edit?postId=${post._id}`}>
                Edit Post <Edit />
              </Link>
            </Button>
          )}
        </div>
        <h3 className="text-lg font-medium">{post.title}</h3>
        <p className="-mb-2 -mt-4">
          <Badge size="sm">
            <Icon name="trend-up" className="text-primary" />
            {formatNumber(post.views)} impressions
          </Badge>
        </p>
        <article className="border-l py-4  max-w-full prose prose-sm dark:prose-invert pl-2 bg-muted/10">
          <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
        </article>
        <PostFooter post={post} user={session?.user!} />
      </div>
      <div id="ads-section" className="mt-4">
        <AdUnit adSlot="display-horizontal" key="community-post-ad" />
      </div>
      <div id="comments-section" className="mt-4">
        {/* <CommentsWithAuth
            page={`community/posts/${post._id}`}
          /> */}
      </div>
    </main>
  );
}
