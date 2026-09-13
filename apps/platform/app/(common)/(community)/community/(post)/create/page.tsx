import CreateCommunityPost from "@/components/application/community/form.create";
import {
  getCategory,
  signInHref,
} from "@/components/application/community/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "~/auth/server";

export const metadata: Metadata = {
  title: "New post",
  description: "Start a discussion in the community",
  robots: { index: false },
};

export default async function CreateCommunityPostPage(props: {
  searchParams: Promise<{ c?: string; title?: string }>;
}) {
  const [searchParams, session] = await Promise.all([
    props.searchParams,
    getSession(),
  ]);
  if (!session) {
    const query = new URLSearchParams(
      Object.entries(searchParams).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    ).toString();
    redirect(signInHref(`/community/create${query ? `?${query}` : ""}`));
  }

  return (
    <CreateCommunityPost
      defaultCategory={getCategory(searchParams.c)?.value}
      defaultTitle={searchParams.title?.slice(0, 120)}
    />
  );
}
