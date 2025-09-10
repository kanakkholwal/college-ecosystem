import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
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
  ...frontmatter
}: ResourceCardProps) {
  return (
    <Link
      href={`/resources/${type}/${slug}`}
      className="block group active:scale-95 hover:scale-101 transition-transform duration-300 ease-in-out"
    >
      <div className="border text-card-foreground bg-card overflow-hidden rounded-2xl shadow-md hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 transition-all duration-500 ease-in-out">
        {(coverImage || appConfig.flags.enableOgImage) && showImage && (
          <div className="relative h-52 w-full aspect-video overflow-hidden">
            <Image
              src={coverImage || `/og/resources/${type}/${slug}`}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            {frontmatter?.author?.name && (
              <span>
                By
                <span className="text-primary ml-1">
                  {frontmatter?.author?.name}
                </span>
              </span>
            )}

            {readingTime && <span>{readingTime}</span>}
          </div>

          <h2 className="text-lg font-semibold line-clamp-2">{title}</h2>
          <p  className="text-muted-foreground text-xs">
              On {new Date(date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </p>
          {summary && (
            <p className="text-muted-foreground text-sm line-clamp-3">
              {summary}
            </p>
          )}

          <div className="flex flex-wrap gap-1 pt-2">
            {category && (
              <Badge variant="default_light" appearance="light" className="text-xs capitalize">
                {category}
              </Badge>
            )}
            {tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="default" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </div>
    </Link>
  );
}
