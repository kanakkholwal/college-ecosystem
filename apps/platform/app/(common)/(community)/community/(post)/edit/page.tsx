import { Button } from "@/components/ui/button";
import EditCommunityPost from "./form";

import EmptyArea from "@/components/common/empty-area";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "~/actions/common.community";
import { Session } from "~/auth";
import { headers } from "next/headers";
import { auth } from "~/auth";

interface Props {
  searchParams: Promise<{
    postId: string;
  }>;
}

export const metadata: Metadata = {
  title: `Edit Community Post`,
  description: "Edit a post in the community",
};

export default async function CommunityPostEditPage(props: Props) {
  const searchParams = await props.searchParams;
  if (!searchParams.postId) return notFound();
  const post = await getPostById(searchParams.postId, true);
  if (!post) return notFound();

  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  }) as Session;
  if (session.user.id !== post.author.id || session.user.role !== "admin") {
    return (
      <EmptyArea
        title="Unauthorized"
        description="You are not authorized to edit this post."
        actionProps={{
          variant: "ghost",
          size: "sm",
          asChild: true,
          children: <Link href="/community">Back to Community</Link>,
        }}
      />
    );
  }

  // console.log(post);
  return (
    <main className="md:col-span-3 space-y-4 pr-2">
      <div className="bg-card w-full rounded-lg inline-flex justify-between items-center gap-3 px-2 lg:px-4 py-1 lg:py-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/community">
            <ArrowLeft />
            Back to Community
          </Link>
        </Button>
        <h3 className="text-sm font-medium text-muted-foreground">
          Editing Post
        </h3>
      </div>
      <EditCommunityPost postId={post._id} post={post} />
    </main>
  );
}
