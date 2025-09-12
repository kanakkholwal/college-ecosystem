import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SortAsc, TrendingUpIcon, VenetianMask } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORY_OPTIONS } from "~/constants/community.whispers";

export const metadata: Metadata = {
  title: {
    default: "Whisper Room",
    template: "%s - Whisper Room",
  },
  description: "Explore different communities",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    // Ensure the layout is only rendered on the client side
    return notFound();
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 min-h-screen w-full max-w-(--max-app-width) mx-auto">
      {/* Sidebar */}
      <aside className="hidden md:block md:col-span-1 space-y-6 sticky top-4 h-fit">
        {/* Communities Section */}
        <div className="bg-card rounded-2xl shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-foreground/80 mb-3 tracking-tight">
            Whisper Room
          </h2>
          <div className="flex flex-col gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 rounded-lg px-2 py-2 hover:bg-muted/60 transition-colors"
              asChild
            >
              <Link href="/community" shallow>
                <VenetianMask className="w-4 h-4 text-primary" />
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
            Popular Categories
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {CATEGORY_OPTIONS.map((category) => (
              <Link
                key={category.label}
                href={`/whispers?type=${category.value}`}
                className="group flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted/60 transition-colors text-sm font-medium text-muted-foreground"
              >
                <category.Icon className="size-5 text-primary group-hover:text-primary/80" />
                <span className="truncate">{category.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>


      {children}
    </div>
  );
}
