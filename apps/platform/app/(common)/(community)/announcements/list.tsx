import { UserPreview } from "@/components/application/user-preview";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  CalendarDays,
  GraduationCap,
  Info,
  Megaphone,
  Trophy
} from "lucide-react";
import Markdown from "react-markdown";
import type { AnnouncementTypeWithId } from "src/models/announcement";
import { Session } from "~/auth/client";
import DeleteButton from "./delete-btn";

// 1. Subtle Color Map (Background Tints + Text Colors)
const CATEGORY_THEME: Record<string, string> = {
  academic: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  event: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  cultural: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  sports: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  other: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20",
};

// 2. Icon Map
const CATEGORY_ICONS: Record<string, any> = {
    academic: GraduationCap,
    event: CalendarDays,
    cultural: Megaphone,
    sports: Trophy,
    other: Info
}

// 3. Dot Color Map (For the timeline)
const DOT_COLORS: Record<string, string> = {
    academic: "bg-blue-500",
    event: "bg-orange-500",
    cultural: "bg-purple-500",
    sports: "bg-emerald-500",
    other: "bg-zinc-500"
}

export default function AnnouncementsList({
  announcements,
  user,
}: {
  announcements: AnnouncementTypeWithId[];
  user?: Session["user"];
}) {
  return (
    <div className="space-y-6 relative">
      
      {/* Timeline Line (Thin & Subtle) */}
      <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border/40 hidden md:block -z-10" />

      {announcements.map((announcement) => {
        const themeClass = CATEGORY_THEME[announcement.relatedFor] || CATEGORY_THEME["other"];
        const dotColor = DOT_COLORS[announcement.relatedFor] || DOT_COLORS["other"];
        const CatIcon = CATEGORY_ICONS[announcement.relatedFor] || Info;
        const isOwner = announcement.createdBy.id === user?.id || user?.role === "admin";

        return (
          <div key={announcement._id} className="relative pl-0 md:pl-12 group">
            
            {/* Timeline Dot (Small & Colored) */}
            <div className="hidden md:flex absolute left-3 top-5 size-4 rounded-full border border-border bg-background items-center justify-center z-10 transition-transform group-hover:scale-110">
                <div className={cn("size-1.5 rounded-full", dotColor)} />
            </div>

            <div
              className={cn(
                "relative rounded-xl border border-border/50 bg-card p-5 transition-all duration-300",
                "hover:shadow-sm hover:border-border/80"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {/* The Badge carries the color now, not the card border */}
                    <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 h-5 gap-1.5 uppercase tracking-wider font-semibold border", themeClass)}>
                       <CatIcon className="size-3" />
                       {announcement.relatedFor}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/60 font-medium">
                      {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold leading-snug text-foreground">
                    {announcement.title}
                  </h3>
                </div>

                {isOwner && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
                    <DeleteButton announcementId={announcement._id} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground/80 leading-relaxed text-sm">
                <Markdown
                    components={{
                        h1: ({children}) => <p className="font-bold text-foreground text-sm mb-1">{children}</p>,
                        h2: ({children}) => <p className="font-semibold text-foreground text-sm mb-1">{children}</p>,
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({children}) => <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>,
                        a: ({href, children}) => <a href={href} className="text-primary hover:underline font-medium" target="_blank">{children}</a>
                    }}
                >
                    {announcement.content}
                </Markdown>
              </div>

              {/* Footer / Author */}
              <div className="mt-4 pt-3 border-t border-border/30 flex items-center gap-2">
                 <UserPreview user={announcement.createdBy}>
                    <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group/author">
                        <span className="size-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground group-hover/author:bg-foreground group-hover/author:text-background transition-colors">
                            {announcement.createdBy.name.charAt(0)}
                        </span>
                        <span className="font-medium">{announcement.createdBy.name}</span>
                    </button>
                 </UserPreview>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}