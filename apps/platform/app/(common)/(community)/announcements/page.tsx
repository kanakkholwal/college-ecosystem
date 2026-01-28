import AnnouncementsList from "@/components/application/announcements/list";
import EmptyArea from "@/components/common/empty-area";
import { Icon } from "@/components/icons";
import { AuthButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  Bell,
  Calendar,
  Filter,
  GraduationCap,
  Info,
  Megaphone,
  Trophy,
  Users
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAnnouncements } from "~/actions/common.announcement";
import { Session } from "~/auth";
import { getSession } from "~/auth/server";
import { RELATED_FOR_TYPES } from "~/constants/common.announcement";
import { changeCase } from "~/utils/string";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Campus news, updates, and official notifications.",
};

// --- Config: Category Icons & Colors ---
const CATEGORY_CONFIG: Record<string, { icon: any; color: string; label?: string }> = {
  all: { icon: Bell, color: "text-foreground", label: "All Updates" },
  academic: { icon: GraduationCap, color: "text-blue-500" },
  event: { icon: Calendar, color: "text-orange-500" },
  cultural: { icon: Megaphone, color: "text-purple-500" },
  sports: { icon: Trophy, color: "text-emerald-500" },
  society: { icon: Users, color: "text-pink-500" },
  other: { icon: Info, color: "text-muted-foreground" },
};

export default async function AnnouncementsPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = (await getSession()) as Session;
  const searchParams = await props.searchParams;
  const currentCategory = searchParams.category || "all";
  const allAnnouncements = await getAnnouncements();

  // Filter Data
  const filteredAnnouncements =
    currentCategory === "all"
      ? allAnnouncements
      : allAnnouncements.filter((a) => a.relatedFor === currentCategory);

  const tabs = ["all", ...RELATED_FOR_TYPES];

  return (
    <div className="min-h-screen pb-20">

      <div className="sticky top-0 z-40">
        <div className="mt-5 container max-w-5xl rounded-2xl mx-auto px-4 w-full border-b border-border/40 bg-card/80 backdrop-blur-md support-[backdrop-filter]:bg-card/60">

          <div className="flex h-16 items-center justify-between gap-4">

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/10">
                <Icon name="announcement" className="size-5" />
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
                  Announcements
                </h1>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium hidden sm:block">
                  Stay updated with the latest news
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Only show "New Post" if authorized */}
              <AuthButtonLink
                authorized={!!session?.user}
                variant="default"
                size="sm"
                href="/announcements/create"
                rounded="full"
                shadow="default"
                icon="plus"
              >
                New Post
              </AuthButtonLink>
            </div>
          </div>

          {/* Bottom Row: Scrollable Filters */}
          <div className="flex items-center gap-2 pb-3 overflow-x-auto no-scrollbar mask-fade-right">
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted/50 text-muted-foreground shrink-0 border border-border/50">
              <Filter className="h-3.5 w-3.5" />
            </div>

            {tabs.map((cat) => {
              const isActive = currentCategory === cat;
              const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG["other"];
              const Icon = config.icon;

              return (
                <Link
                  key={cat}
                  href={cat === "all" ? "/announcements" : `/announcements?category=${cat}`}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap select-none",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                      : "bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary-foreground" : config.color)} />
                  <span>
                    {config.label || changeCase(cat, "camel_to_title")}
                  </span>

                  {/* Counter Badge */}
                  {isActive && (
                    <span className="ml-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-background/20 px-1 text-[10px] font-bold">
                      {filteredAnnouncements.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="container max-w-3xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="sm:hidden mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {CATEGORY_CONFIG[currentCategory]?.label || changeCase(currentCategory, "camel_to_title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? 'post' : 'posts'} found
          </p>
        </div>

        {filteredAnnouncements.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border/60 bg-card/50 p-12">
            <EmptyArea
              icons={[Megaphone]}
              title="All caught up!"
              description={`There are no announcements in the ${currentCategory} category yet.`}
              actionProps={session?.user ? {
                asChild: true,
                variant: "outline",
                children: (
                  <Link href="/announcements/create">Create the first one</Link>
                )
              } : undefined}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <AnnouncementsList
              announcements={filteredAnnouncements}
              user={session?.user}
            />

            {/* End of Feed Indicator */}
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium opacity-60">
                End of list
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}