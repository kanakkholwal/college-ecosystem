import {
  StaggerChildrenContainer,
  StaggerChildrenItem,
} from "@/components/animation/motion";
import { Icon, type IconType } from "@/components/icons";
import { cn } from "@/lib/utils";
import { GitBranch, Github, Star, Users } from "lucide-react";
import {
  FALLBACK_STATS,
  getRepoStats,
  type StatsData,
} from "~/lib/third-party/github";
import { appConfig } from "~/project.config";
import { ButtonLink } from "../utils/link";
import GithubRepoButtons from "./github";

interface GithubBannerProps {
  className?: string;
}

export default async function GithubBanner({ className }: GithubBannerProps) {
  let stats: StatsData;
  try {
    stats = await getRepoStats(appConfig.githubUri);
  } catch (error) {
    console.warn("Error fetching GitHub repository stats:", error);
    stats = { ...FALLBACK_STATS };
  }

  return (
    <section className={cn("py-20 lg:py-28 overflow-hidden", className)}>
      <StaggerChildrenContainer className="container mx-auto px-4 max-w-5xl">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex -rotate-2 items-center rounded-md border border-border px-2.5 py-1 text-caption font-semibold text-foreground">
            <Github className="mr-2 size-3" /> Open Source
          </div>
          <h2 className="text-heading-lg font-medium text-foreground">
            Transparency at Core.
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-body text-muted-foreground md:text-body-lg">
            This platform is built by students, for students. We believe in open
            collaboration to make academic resources accessible to everyone.
          </p>
        </div>

        <StaggerChildrenItem>
          <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-card dark:bg-background">
            {/* Background Grid Pattern */}
            <div className="plate-grid pointer-events-none absolute inset-0 opacity-50" />
            <div className="pointer-events-none absolute right-0 bottom-0 z-0 h-2/3 w-2/3">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden h-full w-full"
                style={{
                  maskImage:
                    "radial-gradient(circle at 100% 100%, black 60%, transparent 100%)",
                  WebkitMaskImage:
                    "radial-gradient(circle at 100% 100%, black 60%, transparent 100%)",
                  opacity: "0.4",
                }}
              >
                <defs>
                  <pattern
                    id=":S1:"
                    width={40}
                    height={40}
                    patternUnits="userSpaceOnUse"
                    x={-1}
                    y={-1}
                  >
                    <path d="M.5 40V.5H40" fill="none" strokeDasharray={0} />
                  </pattern>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  strokeWidth={0}
                  fill="url(#:S1:)"
                />
              </svg>
            </div>
            <div className="flex flex-col lg:flex-row">
              {/* Left: Repo Info */}
              <div className="flex-1 p-8 lg:p-12 space-y-8">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 font-mono">
                    <Icon name="github" className="size-4" />
                    <span>github.com</span>
                  </div>
                  <h3 className="font-mono text-heading-sm font-medium text-foreground">
                    {appConfig.githubUri.split("/")[0]}{" "}
                    <span className="text-muted-foreground">/</span>{" "}
                    {appConfig.githubUri.split("/")[1]}
                  </h3>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 border-t border-border pt-8 sm:gap-12">
                  <StatItem
                    Icon={Star}
                    value={stats.stars}
                    label="Stars"
                    href={`${appConfig.githubRepo}/stargazers`}
                  />
                  <div className="h-8 w-px bg-border" />
                  <StatItem
                    Icon={GitBranch}
                    value={stats.forks}
                    label="Forks"
                    href={`${appConfig.githubRepo}/network/members`}
                  />
                  <div className="h-8 w-px bg-border" />
                  <StatItem
                    Icon={Users}
                    value={`${stats.contributors}+`}
                    label="Contributors"
                    href={`${appConfig.githubRepo}/graphs/contributors`}
                  />
                </div>
              </div>

              {/* Right: Actions (Desktop) / Bottom (Mobile) */}
              <div className="relative flex flex-col justify-center gap-3 border-t border-border p-8 lg:w-72 lg:border-t-0 lg:border-l">
                <GithubRepoButtons />
                <ButtonLink
                  href={`${appConfig.githubRepo}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="ghost"
                  size="sm"
                  className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                >
                  Report an issue
                </ButtonLink>
              </div>
            </div>
          </div>
        </StaggerChildrenItem>

        {/* --- SOCIAL DOCK (Footer) --- */}
        <StaggerChildrenItem className="mt-16 text-center space-y-6">
          <div className="space-y-1">
            <h4 className="text-caption font-semibold text-muted-foreground">
              Maintained By
            </h4>
            <p className="text-body-lg font-medium text-foreground">
              {appConfig.creator || "The Community"}
            </p>
          </div>

          <div className="inline-flex items-center justify-center rounded-2xl border border-border bg-card p-1.5 dark:bg-background">
            {(Object.entries(appConfig.socials) as [IconType, string][]).map(
              ([key, value]) => (
                <a
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center size-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
                  aria-label={`Visit our ${key}`}
                >
                  <Icon name={key} className="size-5" />

                  {/* Tooltip */}
                  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-caption font-medium capitalize text-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                    {key}
                  </span>
                </a>
              )
            )}
          </div>
        </StaggerChildrenItem>
      </StaggerChildrenContainer>
    </section>
  );
}

// --- SUB-COMPONENTS ---

function StatItem({
  Icon,
  value,
  label,
  href,
}: {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  value: string | number;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-1 hover:opacity-80 transition-opacity"
    >
      <div className="flex items-center gap-2 text-heading-sm font-medium tabular-nums text-foreground">
        <Icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
        {value}
      </div>
      <span className="pl-7 text-caption font-medium text-muted-foreground">
        {label}
      </span>
    </a>
  );
}
