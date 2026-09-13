import { cn } from "@/lib/utils";
import { Check, Clock, Eye, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "~/constants/common.community";
import { FEED_SORTS, type FeedSort, feedHref } from "./utils";

type NavProps = { category: string; sort: FeedSort };

const allOption = { value: "all", name: "All posts", image: null } as const;

/** Community list for the feed sidebar. The active row carries a check glyph, not just a fill. */
export function CategoryList({ category, sort }: NavProps) {
  const items = [allOption, ...CATEGORIES];
  return (
    <nav aria-label="Communities">
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = item.value === category;
          return (
            <li key={item.value}>
              <Link
                href={feedHref({ category: item.value, sort })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-2 text-body outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 rounded-lg border border-border object-cover"
                  />
                ) : (
                  <span className="grid size-8 place-items-center rounded-lg border border-border bg-card text-foreground dark:bg-background">
                    <LayoutGrid className="size-4" aria-hidden="true" />
                  </span>
                )}
                <span className="flex-1 truncate">{item.name}</span>
                {active && (
                  <Check className="size-4 text-primary" aria-hidden="true" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Horizontally scrolling community chips for small screens. */
export function CategoryChips({ category, sort }: NavProps) {
  const items = [{ value: "all", name: "All" }, ...CATEGORIES];
  return (
    <nav aria-label="Communities" className="-mx-4 lg:hidden">
      <ul className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {items.map((item) => {
          const active = item.value === category;
          return (
            <li key={item.value} className="shrink-0">
              <Link
                href={feedHref({ category: item.value, sort })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-body outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary/40 bg-primary/10 font-medium text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted dark:bg-background"
                )}
              >
                {active && <Check className="size-4" aria-hidden="true" />}
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const SORT_ICONS = { recent: Clock, popular: Eye } as const;

export function SortTabs({ category, sort }: NavProps) {
  return (
    <nav
      aria-label="Sort posts"
      className="inline-flex h-10 items-center rounded-lg border border-border bg-card p-0.5 dark:bg-background"
    >
      {FEED_SORTS.map((option) => {
        const active = option.value === sort;
        const Icon = SORT_ICONS[option.value];
        return (
          <Link
            key={option.value}
            href={feedHref({ category, sort: option.value })}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-full items-center gap-1.5 rounded-md px-3 text-body outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
