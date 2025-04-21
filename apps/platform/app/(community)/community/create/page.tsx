import CreateCommunityPost from "./form";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Create Community Post | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: "Create a post in the community",
};

export default async function CreateCommunityPostPage() {
  return (
    <>
      <div className="bg-card backdrop-blur-lg mt-5 rounded-lg p-4 @container/community">
        <div className="w-full flex justify-between items-baseline whitespace-nowrap gap-2">
          <h3 className="text-xl font-semibold">Create Community Post</h3>
        </div>
      </div>
      <CreateCommunityPost />
    </>
  );
}
