import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ResourceFrontMatter } from "~/lib/markdown/mdx";
import { appConfig } from "~/project.config";

export type ResourceCardProps = {
  type: string;
  title: string;
  slug: string;
  date: string;
  summary?: string;
  tags?: string[];
  coverImage?: string;
  readingTime?: string;
  category?: string;
  showImage?: boolean;
  className?: string;
} & Partial<ResourceFrontMatter>;

export default function ResourceCard({
  type,
  title,
  slug,
  summary,
  tags = [],
  coverImage,
  date,
  readingTime,
  category,
  showImage = false,
  className,
  ...frontmatter
}: ResourceCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/resources/${type}/${slug}`}
      className={cn(
        // Base: Ultra-thin border (1px), subtle background
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-300",
        // Hover: Soft shadow lift, NO border thickness change, very subtle border color shift
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/10",
        className
      )}
    >
      {/* --- IMAGE SECTION --- */}
      {(coverImage || appConfig.flags.enableOgImage) && showImage ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <Image
            src={coverImage || `/og/resources/${type}/${slug}`}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          
          {/* Category Badge - Floating on Image */}
          {category && (
            <div className="absolute top-3 left-3">
               <Badge variant="secondary" className="backdrop-blur-md bg-background/90 text-foreground/80 font-medium text-[10px] uppercase tracking-wider border-none shadow-sm px-2 py-0.5">
                  {category}
               </Badge>
            </div>
          )}
        </div>
      ) : (
        /* --- NO IMAGE DECORATION --- */
        /* A very thin delicate line instead of a block */
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      )}

      {/* --- CONTENT SECTION --- */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        
        {/* Top Meta (Date & Read Time) */}
        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground/60 font-medium tracking-wide">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3" />
            <time dateTime={date}>{formattedDate}</time>
          </div>
          {readingTime && (
            <>
              <span className="text-border/60">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3" />
                <span>{readingTime}</span>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-3 text-lg sm:text-xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary text-balance">
          {title}
        </h3>

        {/* Summary */}
        {summary && (
          <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        )}

        {/* Footer (Author & Category if no image) */}
        <div className="mt-auto flex items-center justify-between border-t border-border/30 pt-4">
           {/* Author */}
           <div className="flex items-center gap-2 text-xs font-medium text-foreground/70">
              <div className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground/80">
                 <User className="size-3" />
              </div>
              {frontmatter?.author?.name || "Editorial"}
           </div>
           
           {/* Category fallback (if no image) or Tags count */}
           {!showImage && category ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {category}
              </span>
           ) : tags.length > 0 && (
              <span className="text-[10px] text-muted-foreground/60 font-medium bg-muted/50 px-2 py-1 rounded-md">
                #{tags[0]} {tags.length > 1 && `+${tags.length - 1}`}
              </span>
           )}
        </div>
      </div>
    </Link>
  );
}