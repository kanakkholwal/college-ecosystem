import Link from "next/link";
import { CATEGORIES } from "~/constants/common.community";

import AdUnit from "@/components/common/adsense";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { AuthButtonLink } from "@/components/utils/link";
import { X } from "lucide-react";
import type { Metadata } from "next";
import { getPostsByCategory } from "~/actions/common.community";
import { getSession } from "~/auth/server";
import CommunityPostList from "./list";

export const metadata: Metadata = {
  title: "Communities",
  description: "Explore different communities",
  alternates: {
    canonical: "/community",
  },
  keywords: [
    "NITH",
    "Communities",
    "Community Posts",
    "NITH Community",
    "NITH Community Posts",
    "NITH Community Discussions",
    "NITH Community Forum",
    "NITH Community Engagement",
  ],
};

export default async function CommunitiesPage(props: {
  searchParams: Promise<{
    c?: string;
    page?: number;
    limit?: number;
  }>;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams.c || "all"; // Default to 'all' if no category is provided
  const page = searchParams.page || 1;
  const limit = searchParams.limit || 10;
  const session = await getSession();
  const posts = await getPostsByCategory(category, page, limit);

  const activePopularCategory = CATEGORIES.find((c) => c.value === category);
  return (
    <>
      {/* Feed */}
      <main className="md:col-span-3 lg:col-span-2 space-y-4 pr-2 min-h-screen">
        <div className="md:sticky md:top-4 z-50 w-full mx-1.5 lg:mx-auto flex justify-between items-center gap-2 bg-card px-2 lg:px-4 py-1 lg:py-2 rounded-lg border">

          <Icon name="globe" className="inline-block size-6 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">
              Community Posts
              {activePopularCategory && (
                <span className="text-sm text-muted-foreground ml-1">
                  in c/{activePopularCategory.name}
                  <Link
                    href="/community"
                    className="ml-1 hover:text-primary cursor-pointer"
                    shallow
                  >
                    <X className="inline-block size-3" />
                  </Link>
                </span>
              )}
              <Badge size="sm" className="ml-2">
                {posts.length}
              </Badge>
            </h3>
            <p className="text-muted-foreground text-xs">
              Sub-reddits like public communities
            </p>
          </div>
          <div className="inline-flex items-center gap-2 sm:ml-auto">
            <AuthButtonLink
              authorized={!!session?.user}
              variant="ghost"
              size="sm"
              href="/community/create"
            >
              Create Post
              <Icon name="arrow-right" />
            </AuthButtonLink>
          </div>
        </div>
        <CommunityPostList posts={posts} user={session?.user} />
      </main>
      {/* Active Feed Details */}
      <aside className="hidden lg:block md:col-span-1 space-y-4 md:sticky md:top-4 h-fit">
        {activePopularCategory ? (
          <div className="bg-card rounded-2xl shadow p-4">
            <h2 className="text-base font-medium mb-2">
              c/{activePopularCategory.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activePopularCategory.description}
            </p>
          </div>
        ) : null}
        <AdUnit adSlot="display-vertical" key="communities-page-sidebar" />


      </aside>
    </>
  );
}
