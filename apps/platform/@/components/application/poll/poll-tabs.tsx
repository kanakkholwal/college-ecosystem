import { cn } from "@/lib/utils";
import { Clock, Lock, UserRound } from "lucide-react";
import Link from "next/link";
import { POLL_TABS, type PollTab, pollsHref } from "./utils";

const TAB_ICONS = { open: Clock, closed: Lock, mine: UserRound } as const;

export function PollTabs({ active }: { active: PollTab }) {
  return (
    <nav
      aria-label="Poll lists"
      className="inline-flex h-10 items-center rounded-lg border border-border bg-card p-0.5 dark:bg-background"
    >
      {POLL_TABS.map((tab) => {
        const current = tab.value === active;
        const Icon = TAB_ICONS[tab.value];
        return (
          <Link
            key={tab.value}
            href={pollsHref(tab.value)}
            aria-current={current ? "page" : undefined}
            className={cn(
              "inline-flex h-full items-center gap-1.5 rounded-md px-3 text-body outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
              current
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
