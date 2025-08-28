import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "~/constants/common.community";

import AdUnit from "@/components/common/adsense";
import { Button } from "@/components/ui/button";
import { SortAsc, TrendingUpIcon } from "lucide-react";
import type { Metadata } from "next";
import { RiCommunityLine } from "react-icons/ri";

export const metadata: Metadata = {
  title: {
    default: "Communities",
    template: "%s | Communities",
  },
  description: "Explore different communities",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:block md:col-span-1 space-y-6 md:sticky md:top-4 h-fit">
        {/* Communities Section */}
        <div className="bg-card rounded-2xl shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-foreground/80 mb-3 tracking-tight">
            Communities
          </h2>
          <div className="flex flex-col gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 rounded-lg px-2 py-2 hover:bg-muted/60 transition-colors"
              asChild
            >
              <Link href="/community" shallow>
                <RiCommunityLine className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">All Posts</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 rounded-lg px-2 py-2 hover:bg-muted/60 transition-colors"
              asChild
            >
              <Link href="/community?sort=popular" shallow>
                <TrendingUpIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Popular Posts</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 rounded-lg px-2 py-2 hover:bg-muted/60 transition-colors"
              asChild
            >
              <Link href="/community?sort=recent" shallow>
                <SortAsc className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Recent Posts</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Popular Communities Section */}
        <div className="bg-card rounded-2xl shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-foreground/80 mb-3 tracking-tight">
            Popular Communities
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {CATEGORIES.map((category) => (
              <Link
                key={category.value}
                href={`/community?c=${category.value}`}
                className="group flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted/60 transition-colors text-sm font-medium text-muted-foreground"
              >
                <Image
                  src={category.image}
                  alt={category.description}
                  width={40}
                  height={40}
                  className="rounded-full object-cover size-7 border border-border group-hover:scale-105 transition-transform"
                />
                <span className="truncate">c/{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <AdUnit adSlot="display-square" key="communities-layout.tsx" />

      </aside>


      {children}
    </div>
  );
}
