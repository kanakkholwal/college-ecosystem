import EditCommunityPost from "./form";

import EmptyArea from "@/components/common/empty-area";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "~/actions/common.community";
import { auth, Session } from "~/auth";

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
    
      <EditCommunityPost postId={post._id} post={post} />
    </main>
  );
}
