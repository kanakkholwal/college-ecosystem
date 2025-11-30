import EmptyArea from "@/components/common/empty-area";
import { Badge } from "@/components/ui/badge";
import { AuthButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  Bell,
  Calendar,
  GraduationCap,
  Info,
  Megaphone,
  Plus,
  Trophy
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAnnouncements } from "~/actions/common.announcement";
import { Session } from "~/auth";
import { getSession } from "~/auth/server";
import { RELATED_FOR_TYPES } from "~/constants/common.announcement";
import { changeCase } from "~/utils/string";
import AnnouncementsList from "./list";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Campus news, updates, and official notifications.",
};

// --- Config: Category Icons & Colors ---
const CATEGORY_CONFIG: Record<string, { icon: any; color: string }> = {
  all: { icon: Bell, color: "text-foreground" },
  academic: { icon: GraduationCap, color: "text-blue-500" },
  event: { icon: Calendar, color: "text-orange-500" },
  cultural: { icon: Megaphone, color: "text-purple-500" },
  sports: { icon: Trophy, color: "text-emerald-500" },
  other: { icon: Info, color: "text-muted-foreground" },
};

export default async function AnnouncementsPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await getSession() as Session;
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
      
      <div className="sticky top-0 z-30 w-full border-b border-border/40 bg-card/50 backdrop-blur-xl rounded-b-lg">
        <div className="mx-auto px-4">
          
          {/* Top Bar */}
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Megaphone className="size-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-none">Newsroom</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Latest campus updates
                </p>
              </div>
            </div>

            <AuthButtonLink
              authorized={!!session?.user}
              variant="default"
              size="sm"
              href="/announcements/create"
              className="rounded-full shadow-md shadow-primary/20 gap-2"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">New Post</span>
            </AuthButtonLink>
          </div>

          {/* Filter Bar (Scrollable) */}
          <div className="pb-3 -mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              {tabs.map((cat) => {
                const isActive = currentCategory === cat;
                const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG["other"];
                const Icon = config.icon;

                return (
                  <Link
                    key={cat}
                    href={cat === "all" ? "/announcements" : `/announcements?category=${cat}`}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:bg-muted whitespace-nowrap",
                      isActive
                        ? "bg-primary/10 border-primary/20 text-primary ring-1 ring-primary/20"
                        : "bg-background border-border/50 text-muted-foreground"
                    )}
                  >
                    <Icon className={cn("size-3.5", isActive ? "text-primary" : config.color)} />
                    <span className="capitalize">{changeCase(cat, "camel_to_title")}</span>
                    {isActive && (
                      <Badge variant="default_light" className="ml-1 h-4 px-1 text-[9px] min-w-[1.25rem] justify-center bg-background/50">
                        {filteredAnnouncements.length}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {filteredAnnouncements.length === 0 ? (
          <div className="py-20 flex justify-center">
            <EmptyArea
              icons={[Megaphone]}
              title="All caught up!"
              description={`No announcements found in ${currentCategory}.`}
            />
          </div>
        ) : (
          <AnnouncementsList
            announcements={filteredAnnouncements}
            user={session?.user}
          />
        )}
      </main>
    </div>
  );
}