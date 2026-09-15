import { ROLES_ENUMS } from "~/constants";
import { ActivityList } from "@/components/application/activity/list";
import { PostActions } from "@/components/application/community/post-actions";
import {
  AuthorAvatar,
  CategoryChip,
  RelativeTime,
} from "@/components/application/community/post-card";
import { PostComments } from "@/components/application/community/post-comments";
import { PostMenu } from "@/components/application/community/post-menu";
import {
  canManagePost,
  commentsPageId,
  feedHref,
  getCategory,
  toExcerpt,
} from "@/components/application/community/utils";
import AdUnit from "@/components/common/adsense";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { cache } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostById } from "~/actions/common.community";
import { getSession } from "~/auth/server";
import { CATEGORY_IMAGES } from "~/constants/common.community";
import { appConfig } from "~/project.config";
import { formatNumber } from "~/utils/number";
import { getCommentCounts, recordPostView } from "../../data";

interface Props {
  params: Promise<{
    postId: string;
  }>;
}

// Metadata and the page share one read per request.
const loadPost = cache((id: string) => getPostById(id, true));

const prose =
  "prose max-w-none text-body leading-relaxed text-foreground md:text-body-lg prose-headings:font-medium prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-li:marker:text-muted-foreground prose-a:text-primary prose-a:underline-offset-4 prose-blockquote:border-l-border-strong prose-blockquote:font-normal prose-blockquote:text-muted-foreground prose-code:rounded-sm prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted prose-pre:text-foreground prose-img:rounded-xl prose-img:border prose-img:border-border prose-hr:border-border prose-th:text-foreground prose-td:text-foreground";

// The post title is the page h1, so markdown headings start at h2.
const markdownComponents: Components = {
  h1: ({ node: _node, ...props }) => <h2 {...props} />,
  a: ({ node: _node, ...props }) => (
    <a {...props} target="_blank" rel="nofollow ugc noopener noreferrer" />
  ),
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = await loadPost(postId);
  if (!post) return { title: "Post not found" };

  const description = toExcerpt(post.content, 160).text;
  const image = CATEGORY_IMAGES[post.category];
  return {
    title: post.title,
    description,
    alternates: { canonical: `/community/posts/${post._id}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      images: image ? [new URL(image, appConfig.url).toString()] : undefined,
    },
  };
}

export default async function CommunityPost(props: Props) {
  const { postId } = await props.params;
  const [post, session, commentCounts] = await Promise.all([
    loadPost(postId),
    getSession(),
    getCommentCounts([postId]),
  ]);
  if (!post) notFound();

  if (session?.user?.id !== post.author.id) {
    after(() => recordPostView(post._id));
  }

  const viewer = session?.user;
  const category = getCategory(post.category);
  const commentCount = commentCounts[post._id];
  const likes = post.likes ?? [];
  const savedBy = post.savedBy ?? [];
  const image = CATEGORY_IMAGES[post.category];
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.title,
    text: toExcerpt(post.content, 300).text,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: `${appConfig.url}/u/${post.author.username}`,
    },
    datePublished: post.createdAt,
    url: `${appConfig.url}/community/posts/${post._id}`,
    about: category?.name ?? post.category,
    ...(image ? { image: new URL(image, appConfig.url).toString() } : {}),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/LikeAction",
      userInteractionCount: likes.length,
    },
  }).replace(/</g, "\\u003c");

  return (
    <div className="mx-auto w-full max-w-3xl pt-6">
      <script
        type="application/ld+json"
        id="json-ld-community-post"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD with "<" escaped; text children would be HTML-escaped
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <ButtonLink
        href={feedHref({ category: post.category })}
        variant="ghost"
        size="sm"
        className="mb-6 w-fit text-muted-foreground"
      >
        <ArrowLeft />
        {category ? `${category.name} community` : "Community"}
      </ButtonLink>

      <article aria-labelledby="post-title">
        <header className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <AuthorAvatar name={post.author.name} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/u/${post.author.username}`}
                className="block truncate text-body font-medium text-foreground hover:underline"
              >
                {post.author.name}
              </Link>
              <p className="flex min-w-0 items-center gap-1.5 text-caption text-muted-foreground">
                <span className="truncate">@{post.author.username}</span>
                <span aria-hidden="true">·</span>
                <span className="shrink-0">
                  <RelativeTime date={post.createdAt} />
                </span>
              </p>
            </div>
            <CategoryChip value={post.category} />
          </div>
          <h1
            id="post-title"
            className="text-balance text-heading-sm font-medium text-foreground md:text-heading-lg"
          >
            {post.title}
          </h1>
        </header>

        <div className={`${prose} mt-6 wrap-break-word`}>
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {post.content}
          </Markdown>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-y border-border py-1.5">
          <PostActions
            postId={post._id}
            likeCount={likes.length}
            liked={!!viewer && likes.includes(viewer.id)}
            saved={!!viewer && savedBy.includes(viewer.id)}
            signedIn={!!viewer}
            commentHref="#comments"
            commentCount={commentCount}
            className="-ml-3"
          />
          <div className="flex items-center gap-1">
            <p className="flex items-center gap-1.5 px-2 text-caption text-muted-foreground tabular-nums">
              <Eye className="size-4" aria-hidden="true" />
              {formatNumber(post.views ?? 0)}
              <span className="sr-only">views</span>
            </p>
            {viewer?.role === ROLES_ENUMS.ADMIN && (
              <ActivityList targetId={post._id} targetModel="communityPost" />
            )}
            <PostMenu
              postId={post._id}
              title={post.title}
              canManage={canManagePost(viewer, post)}
              className="-mr-2"
            />
          </div>
        </footer>
      </article>

      <section
        id="comments"
        aria-labelledby="comments-heading"
        className="mt-10 scroll-mt-6"
      >
        <h2
          id="comments-heading"
          className="mb-4 text-heading-sm font-medium text-foreground"
        >
          Comments
          {typeof commentCount === "number" && (
            <span className="ml-2 text-body-lg font-normal text-muted-foreground tabular-nums">
              {formatNumber(commentCount)}
            </span>
          )}
        </h2>
        <PostComments
          page={commentsPageId(post._id)}
          sessionId={session?.session.id}
        />
      </section>

      <div className="mt-12">
        <AdUnit adSlot="display-horizontal" key="community-post-ad" />
      </div>
    </div>
  );
}
