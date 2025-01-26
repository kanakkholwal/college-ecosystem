import MarkdownView from "@/components/common/markdown/view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { CATEGORY_IMAGES } from "src/constants/community";
import { getSession } from "src/lib/auth-server";
import { getPostById } from "src/lib/community/actions";
import PostFooter from "./post-footer";

interface Props {
  params: Promise<{
    postId: string;
  }>;
}

import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const { postId } = await params;
  const post = await getPostById(postId, true);
  if (!post) return notFound();

  return {
    title: `${post.title} | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
    description: post.content.slice(0, 100),
    openGraph: {
      images: [
        `${process.env.NEXT_PUBLIC_BASE_URL}/${CATEGORY_IMAGES[post.category]}`,
      ],
    },
  };
}

const cache = new Map<string, boolean>();

export default async function CommunityPost(props: Props) {
  const session = await getSession();
  const params = await props.params;
  const post = await getPostById(
    params.postId,
    cache.has(params.postId) || false
  );

  if (!post) return notFound();
  if (post) {
    cache.set(params.postId, true);
  }
  console.log(post);

  return (
    <>
      <Card variant="glass">
        <CardHeader>
          <div className="flex flex-wrap items-center w-full mb-4">
            <div className="flex gap-2">
              <Avatar className="bg-gray-200 shadow-sm">
                <AvatarImage
                  src={CATEGORY_IMAGES[post.category]}
                  alt={post.category}
                />
                <AvatarFallback>
                  {post.category[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-700 capitalize">
                  {post.category} {" • "}
                  <span className="text-sm text-gray-600 lowercase">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </p>
                <p className="text-xs font-semibold">
                  by @{typeof post.author !== "string" && post.author.rollNo}
                </p>
              </div>
            </div>
          </div>

          <CardTitle>{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownView className="prose prose-sm dark:prose-invert">
            {post.content}
          </MarkdownView>
        </CardContent>
        {/* biome-ignore lint/style/noNonNullAssertion: <explanation> */}
        <PostFooter post={post} user={session?.user!} />
      </Card>
    </>
  );
}
