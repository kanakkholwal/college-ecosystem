import { CATEGORIES } from "~/constants/common.community";

import AdUnit from "@/components/common/adsense";
import { Badge } from "@/components/ui/badge";
import { AuthButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  Globe,
  LayoutGrid,
  MessageSquarePlus
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getPostsByCategory } from "~/actions/common.community";
import { getSession } from "~/auth/server";
import CommunityPostList from "./list";

export const metadata: Metadata = {
  title: "Community Feed",
  description: "Join the conversation.",
  alternates: {
    canonical: "/community",
  },
};

export default async function CommunitiesPage(props: {
  searchParams: Promise<{
    c?: string;
    page?: number;
    limit?: number;
  }>;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams.c || "all";
  const page = searchParams.page || 1;
  const limit = searchParams.limit || 10;

  const session = await getSession();

  const posts = await getPostsByCategory(category, page, limit);
  const activeCategory = CATEGORIES.find((c) => c.value === category);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* --- CENTER COLUMN: FEED --- */}
      <div className="lg:col-span-2 min-h-screen space-y-6">

        {/* Sticky Header */}
        <div className="sticky top-4 z-30 rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl px-4 py-3 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex size-10 items-center justify-center rounded-lg border shadow-sm",
                activeCategory ? "bg-background" : "bg-primary/10 text-primary border-primary/20"
              )}>
                {activeCategory ? (
                  <div className="relative size-full overflow-hidden rounded-lg">
                    <Image src={activeCategory.image} alt="" fill className="object-cover" />
                  </div>
                ) : (
                  <Globe className="size-5" />
                )}
              </div>

              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-foreground flex items-center gap-2">
                  {activeCategory ? `c/${activeCategory.name}` : "Global Feed"}
                  <Badge variant="default" size="xs" className="font-mono">
                    {posts.length}
                  </Badge>
                </h1>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {activeCategory ? "Community Discussions" : "All public conversations"}
                </p>
              </div>
            </div>

            <AuthButtonLink
              authorized={!!session?.user}
              href={`/community/create${activeCategory ? `?c=${activeCategory.value}` : ""}`}
              size="sm"
              variant="default"
              className="gap-2 shadow-md shadow-primary/20"
            >
              <MessageSquarePlus className="size-4" />
              <span className="hidden sm:inline">New Post</span>
            </AuthButtonLink>
          </div>
        </div>

        {/* Post List */}
        <div className="space-y-4">
          <CommunityPostList posts={posts} user={session?.user} />
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-1 space-y-6">

        <div className="sticky top-24 space-y-6">
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <div className="h-16 bg-accent/50 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
            </div>

            <div className="px-5 pb-5 -mt-8">
              {/* Icon */}
              <div className="relative size-16 rounded-xl border-4 border-card bg-background overflow-hidden shadow-sm mb-3">
                {activeCategory ? (
                  <Image src={activeCategory.image} alt="" fill className="object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center bg-primary/5 text-primary">
                    <LayoutGrid className="size-8" />
                  </div>
                )}
              </div>

              <h2 className="text-lg font-bold">
                {activeCategory ? `c/${activeCategory.name}` : "Community"}
              </h2>

              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {activeCategory?.description || "Welcome to the NITH community forum. A place to share ideas, ask questions, and connect with peers."}
              </p>

              <div className="flex gap-4 mt-4 py-4 border-t border-b border-border/50">
                <div className="flex flex-col">
                  <span className="text-base font-bold">{posts.length}</span>
                  <span className="text-xs text-muted-foreground">Posts</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold">--</span>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Posting Rules
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>Be respectful and civil.</li>
                  <li>No spam or self-promotion.</li>
                  <li>Keep discussions relevant.</li>
                </ul>
              </div>
            </div>
          </div>

          <AdUnit adSlot="display-vertical" key="communities-context-sidebar" />
        </div>
      </div>

    </div>
  );
}