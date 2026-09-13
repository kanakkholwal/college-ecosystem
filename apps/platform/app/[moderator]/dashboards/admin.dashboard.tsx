import { AreaChartLazy } from "@/components/application/dashboard/area-chart-lazy";
import { PeriodSelect } from "@/components/application/dashboard/period-select";
import {
  DashboardHeader,
  DashboardRoot,
  DashboardSection,
  PanelSkeleton,
  PanelTitle,
  Panel,
  RankedBars,
  SectionError,
} from "@/components/application/dashboard/primitives";
import { getViewer, greeting } from "@/components/application/dashboard/viewer";
import {
  KpiCard,
  KpiGrid,
  KpiGridSkeleton,
} from "@/components/application/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  flushCache,
  getPlatformDBStats,
  getUsersByDepartment,
  getUsersByGender,
  getUsersByRole,
  sessions_CountAndGrowth,
  type UserCountAndGrowthResult,
  users_CountAndGrowth,
} from "~/actions/dashboard.admin";
import {
  getDepartmentCode,
  getDepartmentShort,
} from "~/constants/core.departments";
import { extractVisitorCount } from "~/lib/third-party/github";
import { TIME_INTERVALS, type TimeInterval } from "~/utils/process";
import { changeCase } from "~/utils/string";
import { FlushCacheButton } from "./client";

interface AdminDashboardProps {
  role: string;
  searchParams: {
    period?: string;
  };
}

const PERIOD_COPY: Record<
  TimeInterval,
  { current: string; previous: string; bucket: "date" | "time" | "month" }
> = {
  last_hour: {
    current: "the last hour",
    previous: "vs previous hour",
    bucket: "time",
  },
  last_24_hours: {
    current: "the last 24 hours",
    previous: "vs previous 24 hours",
    bucket: "time",
  },
  last_week: { current: "this week", previous: "vs last week", bucket: "date" },
  last_month: {
    current: "this month",
    previous: "vs last month",
    bucket: "date",
  },
  last_year: { current: "this year", previous: "vs last year", bucket: "month" },
};

function parsePeriod(value?: string): TimeInterval {
  return TIME_INTERVALS.some((option) => option.value === value)
    ? (value as TimeInterval)
    : "last_week";
}

export default async function AdminDashboard({
  role,
  searchParams,
}: AdminDashboardProps) {
  const period = parsePeriod(searchParams?.period);
  const copy = PERIOD_COPY[period];
  const viewer = await getViewer();

  return (
    <DashboardRoot>
      <DashboardHeader
        title={greeting(viewer?.name)}
        context={`Platform activity for ${copy.current}, compared with the period before.`}
        actions={
          <>
            <PeriodSelect value={period} />
            <FlushCacheButton flushFn={flushCache} />
          </>
        }
      />

      <ErrorBoundaryWithSuspense
        loadingFallback={<KpiGridSkeleton />}
        fallback={<SectionError what="Key numbers" />}
      >
        <AdminKpis period={period} role={role} />
      </ErrorBoundaryWithSuspense>

      <DashboardSection
        id="growth"
        title="Growth"
        description={`New accounts and sign-ins across ${copy.current} and the period before it.`}
      >
        <ErrorBoundaryWithSuspense
          loadingFallback={
            <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-2">
              <PanelSkeleton rows={4} />
              <PanelSkeleton rows={4} />
            </div>
          }
          fallback={<SectionError what="Growth charts" />}
        >
          <GrowthCharts period={period} />
        </ErrorBoundaryWithSuspense>
      </DashboardSection>

      <DashboardSection
        id="audience"
        title="Who uses the platform"
        description="All accounts, all time."
        viewAll={{ href: `/${role}/users`, label: "Manage users" }}
      >
        <ErrorBoundaryWithSuspense
          loadingFallback={
            <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-3">
              <PanelSkeleton rows={4} />
              <PanelSkeleton rows={4} />
              <PanelSkeleton rows={3} />
            </div>
          }
          fallback={<SectionError what="User breakdown" />}
        >
          <AudienceBreakdown />
        </ErrorBoundaryWithSuspense>
      </DashboardSection>

      <DashboardSection
        id="content"
        title="Content"
        description="Records stored on the platform, all time."
      >
        <ErrorBoundaryWithSuspense
          loadingFallback={
            <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-5">
              {["results", "polls", "posts", "events", "visits"].map((key) => (
                <Skeleton key={key} className="h-24 rounded-2xl bg-muted" />
              ))}
            </div>
          }
          fallback={<SectionError what="Content totals" />}
        >
          <ContentTotals role={role} />
        </ErrorBoundaryWithSuspense>
      </DashboardSection>
    </DashboardRoot>
  );
}

function currentSeries(stats: { graphData: UserCountAndGrowthResult["graphData"]; periodStart: Date }) {
  const start = new Date(stats.periodStart).getTime();
  return stats.graphData
    .filter((point) => new Date(point.timestamp).getTime() >= start)
    .map((point) => point.count);
}

function periodDelta(
  current: number,
  previous: number,
  growthPercent: number,
  period: string
) {
  // A percentage off a zero base is meaningless, so fall back to the raw change.
  return previous > 0
    ? { value: growthPercent, unit: "%", period }
    : { value: current - previous, period };
}

async function AdminKpis({
  period,
  role,
}: {
  period: TimeInterval;
  role: string;
}) {
  const copy = PERIOD_COPY[period];
  const [usersStats, sessionsStats] = await Promise.all([
    users_CountAndGrowth(period),
    sessions_CountAndGrowth(period),
  ]);

  return (
    <KpiGrid>
      <KpiCard
        label="New users"
        value={usersStats.currentPeriodCount}
        delta={periodDelta(
          usersStats.currentPeriodCount,
          usersStats.previousPeriodCount,
          usersStats.growthPercent,
          copy.previous
        )}
        hint={`Accounts created in ${copy.current}`}
        trend={currentSeries(usersStats)}
        href={`/${role}/users`}
      />
      <KpiCard
        label="Sign-ins"
        value={sessionsStats.currentPeriodCount}
        delta={periodDelta(
          sessionsStats.currentPeriodCount,
          sessionsStats.previousPeriodCount,
          sessionsStats.growthPercent,
          copy.previous
        )}
        hint={`${sessionsStats.uniqueUsers.toLocaleString("en-IN")} people in ${copy.current}`}
        trend={currentSeries(sessionsStats)}
      />
      <KpiCard
        label="Signed in now"
        value={sessionsStats.activeUsers}
        hint="People with an unexpired session, right now"
      />
      <KpiCard
        label="Total users"
        value={usersStats.totalUsers}
        hint="All accounts, all time"
        href={`/${role}/users`}
      />
    </KpiGrid>
  );
}

async function GrowthCharts({ period }: { period: TimeInterval }) {
  const copy = PERIOD_COPY[period];
  const [usersStats, sessionsStats] = await Promise.all([
    users_CountAndGrowth(period),
    sessions_CountAndGrowth(period),
  ]);

  const toPoints = (
    graph: UserCountAndGrowthResult["graphData"],
    key: string
  ) => graph.map((point) => ({ timestamp: point.timestamp, [key]: point.count }));

  return (
    <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-2">
      <AreaChartLazy
        title="New users"
        titleAs="h3"
        description={`${usersStats.currentPeriodCount.toLocaleString("en-IN")} in ${copy.current}, ${usersStats.previousPeriodCount.toLocaleString("en-IN")} before`}
        summary={`${usersStats.currentPeriodCount} new users in ${copy.current}, compared with ${usersStats.previousPeriodCount} in the previous period.`}
        data={toPoints(usersStats.graphData, "users")}
        series={[{ dataKey: "users", label: "New users", color: "var(--chart-1)" }]}
        xAxisFormat={copy.bucket}
        showYAxis
        showLegend={false}
        chartHeight={220}
        emptyStateMessage="No sign-ups in this window yet"
      />
      <AreaChartLazy
        title="Sign-ins"
        titleAs="h3"
        description={`${sessionsStats.currentPeriodCount.toLocaleString("en-IN")} in ${copy.current}, ${sessionsStats.previousPeriodCount.toLocaleString("en-IN")} before`}
        summary={`${sessionsStats.currentPeriodCount} sign-ins in ${copy.current}, compared with ${sessionsStats.previousPeriodCount} in the previous period.`}
        data={toPoints(sessionsStats.graphData, "sessions")}
        series={[
          { dataKey: "sessions", label: "Sign-ins", color: "var(--chart-2)" },
        ]}
        xAxisFormat={copy.bucket}
        showYAxis
        showLegend={false}
        chartHeight={220}
        emptyStateMessage="No sign-ins in this window yet"
      />
    </div>
  );
}

async function AudienceBreakdown() {
  const [byRole, byDepartment, byGender] = await Promise.all([
    getUsersByRole(),
    getUsersByDepartment(),
    getUsersByGender(),
  ]);

  return (
    <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-3">
      <Panel>
        <PanelTitle>By role</PanelTitle>
        <RankedBars
          unit="accounts"
          items={byRole.map((row) => ({
            label: changeCase(row.role.replaceAll("_", " "), "title"),
            value: row.count,
          }))}
        />
        <p className="mt-3 text-caption text-muted-foreground">
          People with several roles count once per role.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>By department</PanelTitle>
        <RankedBars
          items={byDepartment.map((row) => ({
            label:
              getDepartmentShort(getDepartmentCode(row.department)) ||
              row.department,
            value: row.count,
          }))}
        />
      </Panel>
      <Panel>
        <PanelTitle>By gender</PanelTitle>
        <RankedBars
          items={Object.entries(byGender).map(([gender, count]) => ({
            label: changeCase(gender.replaceAll("_", " "), "title"),
            value: count,
          }))}
        />
      </Panel>
    </div>
  );
}

async function ContentTotals({ role }: { role: string }) {
  const [stats, visits] = await Promise.all([
    getPlatformDBStats(),
    extractVisitorCount(),
  ]);

  const tiles = [
    { label: "Results", value: stats.results, href: `/${role}/result` },
    { label: "Polls", value: stats.polls, href: "/polls" },
    { label: "Community posts", value: stats.communityPosts, href: "/community" },
    { label: "Events", value: stats.events, href: `/${role}/events` },
    { label: "Site visits", value: visits, href: undefined },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 @3xl:grid-cols-5">
      {tiles.map((tile) => {
        const inner = (
          <>
            <span className="flex items-center justify-between gap-2 text-body text-muted-foreground">
              {tile.label}
              {tile.href && (
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              )}
            </span>
            <span className="font-heading text-subheading font-medium tabular-nums text-foreground">
              {tile.value > 0 ? tile.value.toLocaleString("en-IN") : "No data yet"}
            </span>
          </>
        );
        const base =
          "flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 dark:bg-background";
        return (
          <li key={tile.label}>
            {tile.href ? (
              <Link
                href={tile.href}
                className={`${base} outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring`}
              >
                {inner}
              </Link>
            ) : (
              <div className={base}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
