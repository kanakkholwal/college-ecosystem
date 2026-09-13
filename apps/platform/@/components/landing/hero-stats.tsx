import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { getPublicStats } from "~/actions/public";
import { HeroStat, ImpressionsStat } from "./hero-stat";

function StatsSkeleton() {
  return (
    <>
      {["Members", "GitHub stars", "Sign-in sessions"].map((label) => (
        <div key={label} className="flex flex-col gap-0.5">
          <Skeleton className="h-8 w-16" />
          <span className="text-caption text-muted-foreground">{label}</span>
        </div>
      ))}
    </>
  );
}

async function ServerStats() {
  const stats = await getPublicStats();
  return (
    <>
      <HeroStat label="Members" value={stats.userCount} />
      <HeroStat label="GitHub stars" value={stats.githubStats.stars} />
      <HeroStat label="Sign-in sessions" value={stats.sessionCount} />
    </>
  );
}

/** Live platform numbers under the hero actions; they stream in so the headline never waits. */
export function HeroStats() {
  return (
    <dl className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 sm:grid-cols-4">
      <ImpressionsStat />
      <Suspense fallback={<StatsSkeleton />}>
        <ServerStats />
      </Suspense>
    </dl>
  );
}
