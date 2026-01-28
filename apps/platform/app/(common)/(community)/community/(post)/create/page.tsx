import CreateCommunityPost from "@/components/application/community/form.create";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Create Community Post`,
  description: "Create a post in the community",
};

export default function CreateCommunityPostPage() {
  return (
    <main className="md:col-span-3 space-y-4 pr-2">

      <CreateCommunityPost />
    </main>
  );
}
