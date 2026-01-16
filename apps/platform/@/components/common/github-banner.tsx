import { StaggerChildrenContainer, StaggerChildrenItem } from "@/components/animation/motion";
import { Icon, IconType } from "@/components/icons";
import { cn } from "@/lib/utils";
import { GitBranch, Github, Star, Users } from "lucide-react";
import { getRepoStats, StatsData } from "~/lib/third-party/github";
import { appConfig } from "~/project.config";
import { marketwiseLink } from "~/utils/string";
import { ButtonLink } from "../utils/link";

interface GithubBannerProps {
  className?: string;
}

export default async function GithubBanner({ className }: GithubBannerProps) {
  let stats: StatsData;
  try {
    stats = await getRepoStats(appConfig.githubUri);
  } catch (error) {
    console.warn("Error fetching GitHub repository stats:", error);
    stats = {
      stars: 12,
      forks: 2,
      contributors: 1,
      visitors: 10_40_000,
    };
  }

  return (
    <section className={cn("py-20 lg:py-28 overflow-hidden", className)}>
      <StaggerChildrenContainer className="container mx-auto px-4 max-w-5xl">

        {/* --- HEADER --- */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Github className="mr-2 size-3" /> Open Source
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Transparency at Core.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            This platform is built by students, for students. We believe in open collaboration
            to make academic resources accessible to everyone.
          </p>
        </div>

        {/* --- REPO PREVIEW CARD --- */}
        <StaggerChildrenItem>
          <div className="group relative w-full overflow-hidden rounded-3xl border border-border/40 bg-card/60 backdrop-blur-sm shadow-xl transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(#8080801a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_100%,transparent_100%)] opacity-70" />
            <div className="pointer-events-none absolute right-0 bottom-0 z-0 h-2/3 w-2/3">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 fill-gray-400/30 stroke-gray-400/30 h-full w-full"
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
                  <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
                    {appConfig.githubUri.split("/")[0]} <span className="text-muted-foreground">/</span> {appConfig.githubUri.split("/")[1]}
                  </h3>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 sm:gap-12 border-t border-border/40 pt-8">
                  <StatItem
                    Icon={Star}
                    value={stats.stars}
                    label="Stars"
                    href={`${appConfig.githubRepo}/stargazers`}
                  />
                  <div className="h-8 w-px bg-border/40" />
                  <StatItem
                    Icon={GitBranch}
                    value={stats.forks}
                    label="Forks"
                    href={`${appConfig.githubRepo}/network/members`}
                  />
                  <div className="h-8 w-px bg-border/40" />
                  <StatItem
                    Icon={Users}
                    value={`${stats.contributors}+`}
                    label="Contributors"
                    href={`${appConfig.githubRepo}/graphs/contributors`}
                  />
                </div>
              </div>

              {/* Right: Actions (Desktop) / Bottom (Mobile) */}
              <div className="lg:w-72 bg-muted/20 border-t lg:border-t-0 lg:border-l border-border/40 p-8 flex flex-col justify-center gap-4">
                <ButtonLink
                  href={marketwiseLink(appConfig.githubRepo, {
                    utm_medium: "app",
                    utm_campaign: "github-banner",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  width="full"
                  variant="rainbow"
                  size="lg"
                  >
                  <Star  /> Star Repository
                </ButtonLink>

                <ButtonLink
                  href={`${appConfig.githubRepo}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  width="full"
                  variant="outline"
                  size="lg"
                >
                  <GitBranch  /> Fork & Contribute
                </ButtonLink>
              </div>
            </div>
          </div>

        </StaggerChildrenItem>

        {/* --- SOCIAL DOCK (Footer) --- */}
        <StaggerChildrenItem className="mt-16 text-center space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Maintained By</h4>
            <p className="text-lg font-medium text-foreground">{appConfig.creator || "The Community"}</p>
          </div>

          <div className="inline-flex items-center justify-center p-1.5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
            {(Object.entries(appConfig.socials) as [IconType, string][]).map(([key, value]) => (
              <a
                key={key}
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center size-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
                aria-label={`Visit our ${key}`}
              >
                <Icon name={key} className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:text-primary" />

                {/* Tooltip */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none capitalize whitespace-nowrap backdrop-blur font-mono">
                  {key}
                </span>
              </a>
            ))}
          </div>
        </StaggerChildrenItem>

      </StaggerChildrenContainer>
    </section>
  );
}

// --- SUB-COMPONENTS ---

function StatItem({ Icon, value, label, href }: { Icon: React.FC<React.SVGProps<SVGSVGElement>>, value: string | number, label: string, href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-1 hover:opacity-80 transition-opacity">
      <div className="flex items-center gap-2 text-2xl font-bold tabular-nums text-foreground">
        <Icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
        {value}
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-7">
        {label}
      </span>
    </a>
  )
}