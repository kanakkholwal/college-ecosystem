"use client";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type SettingsNavItem = {
  href: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
};

/** Settings section list. `variant="rail"` is the desktop side nav; `"list"` is the mobile index. */
export function SidebarNav({
  className,
  items,
  variant = "rail",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  items: SettingsNavItem[];
  variant?: "rail" | "list";
}) {
  const pathname = usePathname();

  if (variant === "list") {
    return (
      <nav aria-label="Settings sections" className={className} {...props}>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card dark:bg-background">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-16 items-center gap-3 px-4 py-3 outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {Icon && (
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground">
                      <Icon className="size-5" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="block text-caption text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Settings sections" className={className} {...props}>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2.5 rounded-lg px-3 text-body outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {Icon && (
                  <Icon className={cn("size-4", active && "text-primary")} />
                )}
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
