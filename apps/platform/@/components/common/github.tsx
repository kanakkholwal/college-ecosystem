import { cn } from "@/lib/utils";
import { GitFork, Star } from "lucide-react";
import { Suspense } from "react";
import { FALLBACK_STATS, getRepoStats } from "~/lib/third-party/github";
import { appConfig } from "~/project.config";

const compact = new Intl.NumberFormat("en", { notation: "compact" });

function RepoButton({
  href,
  label,
  count,
  icon: Icon,
}: {
  href: string;
  label: string;
  count: number;
  icon: typeof Star;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} on GitHub, ${count}`}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card pl-3 pr-1.5 text-body font-medium text-foreground shadow-xs outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring dark:bg-background"
    >
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      {label}
      <span className="rounded-full bg-muted px-2 py-0.5 text-caption tabular-nums text-foreground">
        {compact.format(count)}
      </span>
    </a>
  );
}

function RepoButtonsView({
  stars,
  forks,
  className,
}: {
  stars: number;
  forks: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <RepoButton
        href={`${appConfig.githubRepo}/fork`}
        label="Fork"
        count={forks}
        icon={GitFork}
      />
      <RepoButton
        href={appConfig.githubRepo}
        label="Star"
        count={stars}
        icon={Star}
      />
    </div>
  );
}

async function RepoButtonsData({ className }: { className?: string }) {
  const stats = await getRepoStats().catch(() => FALLBACK_STATS);
  return (
    <RepoButtonsView
      stars={stats.stars}
      forks={stats.forks}
      className={className}
    />
  );
}

/** GitHub-style Fork and Star buttons with live counts; renders fallback counts while loading. */
export default function GithubRepoButtons({
  className,
}: {
  className?: string;
}) {
  return (
    <Suspense
      fallback={
        <RepoButtonsView
          stars={FALLBACK_STATS.stars}
          forks={FALLBACK_STATS.forks}
          className={className}
        />
      }
    >
      <RepoButtonsData className={className} />
    </Suspense>
  );
}
