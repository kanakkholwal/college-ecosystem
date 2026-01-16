import { NumberTicker } from "@/components/animation/number-ticker";
import {
  ChartBar,
  RoundedPieChart
} from "@/components/application/charts";
import { StatCardSimple, StatsCard } from "@/components/application/stats-card";
import { HeaderBar } from "@/components/common/header-bar";
import { GenericAreaChart } from "@/components/extended/chart.area";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  CircleDashed,
  Network,
  Transgender,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { PiChartBarDuotone } from "react-icons/pi";
import {
  getActiveSessions,
  getPlatformDBStats,
  getUsersByDepartment,
  getUsersByGender,
  getUsersByRole,
  SessionCountAndGrowthResult,
  sessions_CountAndGrowth,
  UserCountAndGrowthResult,
  users_CountAndGrowth,
} from "~/actions/dashboard.admin";
import { ROLES } from "~/constants";
import {
  DEPARTMENTS_LIST,
  getDepartmentCode,
  getDepartmentName
} from "~/constants/core.departments";
import { flushAllRedisKeys } from "~/lib/redis";
import { extractVisitorCount } from "~/lib/third-party/github";
import { TimeInterval } from "~/utils/process";
import { changeCase } from "~/utils/string";
import { FlushCacheButton } from "./client";

interface AdminDashboardProps {
  role: string;
  searchParams: {
    period?: TimeInterval;
  }
}
export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const period = (searchParams?.period || "last_week") as TimeInterval;
  const [usersStats, sessionsStats] = await Promise.all(
    [
      users_CountAndGrowth(period),
      sessions_CountAndGrowth(period),
    ]
  )

  const [usersByGender, usersByRole, usersByDepartment, activeSessions] =
    await Promise.all([
      getUsersByGender(),
      getUsersByRole(),
      getUsersByDepartment(),
      getActiveSessions(),
    ]);

  const [count, platformDBStats] = await Promise.all([
    extractVisitorCount(),
    getPlatformDBStats(),
  ]);



  return (
    <div className="space-y-6 my-5 pr-2">

      <HeaderBar
        Icon={PiChartBarDuotone}
        titleNode={
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Admin Dashboard
            </h1>

          </div>
        }
        descriptionNode="Comprehensive overview of platform usage, user statistics, and system health."
        actionNode={<FlushCacheButton flushFn={flushAllRedisKeys} />}
      />
      <div className="grid grid-cols-1 @xl:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 @xl:grid-cols-2 gap-2">
          {[
            {
              title: "New Users",
              value: usersStats.totalUsers,
              change: usersStats.growthPercent?.toFixed(2) + "%",
              isPositive: usersStats.trend === 1,
              type: 'measured',
              icon: <Icon name="users"  />,
              trend: usersStats.trend,
              growthPercent: usersStats.growthPercent,
            },
            {
              title: "New Sessions",
              value: sessionsStats.totalSessions,
              change: sessionsStats.growthPercent?.toFixed(2) + "%",
              isPositive: sessionsStats.trend === 1,
              type: 'not_measured',
              icon: <Icon name="broadcast" />,
              trend: sessionsStats.trend,
              growthPercent: sessionsStats.growthPercent,
            },

            {
              title: "Active Sessions",
              value: activeSessions,
              change: "",
              isPositive: true,
              type: 'growth',
              trend: 1,
              growthPercent: 0,
              icon: <Badge size="sm" variant="default_soft" className="">
                {activeSessions}  Online
              </Badge>
            },
            {
              title: "Total Visitors",
              value: count,
              change: "5.4%",
              isPositive: true,
              type: 'not_measured',
              icon: <Icon name="eye" />,
              trend: 1,
              growthPercent: 5.4,
            },

          ].map((stat) => <StatCardSimple
            key={stat.title}
            title={stat.title}
            Icon={stat.icon}
            description={<>
              <span
                className={`${stat.trend === 1
                  ? "text-green-500"
                  : stat.trend === -1
                    ? "text-red-500"
                    : "text-primary/80"
                  } text-base`}
              >
                {stat.trend === 1 ? (
                  <TrendingUp className="inline-block mr-2 size-4" />
                ) : stat.trend === -1 ? (
                  <TrendingDown className="inline-block mr-2 size-4" />
                ) : (
                  <CircleDashed className="inline-block mr-2 size-4" />
                )}
                {stat?.growthPercent?.toFixed(2)}%
              </span>{" "}
              from {changeCase(period, "title")}

            </>}
          >
            <NumberTicker
              value={stat.value}
              className={cn(
                "text-3xl font-bold text-primary after:text-xs",
                usersStats.trend === 1
                  ? "after:text-green-500"
                  : usersStats.trend === -1
                    ? "after:text-red-500"
                    : "after:text-primary/80"
              )}
              suffix={
                stat.trend === 1
                  ? "↑" + stat.growthPercent
                  : stat.trend === -1
                    ? "↓" + stat.growthPercent
                    : ""
              }
            />
          </StatCardSimple>
          )}
        </div>
        <StatsCard className="max-h-96"
          title="Platform DB Stats"
          Icon={<Network className="inline-block mr-2 size-4" />}
        >
          <ChartBar
            data={Object.entries(platformDBStats).map(([key, value]) => {
              return {
                key,
                count: value,
              };
            })}
            config={{
              count: {
                label: "count",
              },
              ...Object.keys(platformDBStats).reduce<
                Record<string, { label: string; color: string }>
              >((acc, key, idx) => {
                acc[key] = {
                  label: changeCase(key.toString(), "camel_to_title"),
                  color: `var(--chart-${idx + 1})`,
                };
                return acc;
              }, {}),
            }}
            orientation="horizontal"
            dataKey="count"
            nameKey="key"
          />
        </StatsCard>
      </div>




      <div className="w-full grid grid-cols-1 @lg:grid-cols-2 @4xl:grid-cols-12 gap-4 pr-1.5 @4xl:pr-0">

        {/* Combined analytics overview */}

        <GenericAreaChart
          data={cumulateStats(usersStats, sessionsStats)}
          series={[
            { dataKey: "users", label: "New Users", color: "var(--chart-1)" },
            { dataKey: "sessions", label: "Sessions", color: "var(--chart-2)" },
          ]}
          title="Users & Sessions Overview"
          description={`Overview over ${changeCase(period, "title")}`}
          showTimeRangeFilter={true}
          chartHeight={350}
          stacked={false}
          showLegend={true}
          showYAxis={true}
          className="col-span-1  @4xl:col-span-12"
        />

        {/* Users by Gender Card */}

        <StatsCard className="col-span-1  @4xl:col-span-6"
          title="Users by Gender"
          Icon={<Transgender className="inline-block mr-2 size-4" />}
        >

          <RoundedPieChart
            data={Object.entries(usersByGender).map(([key, value], index) => ({
              gender: key,
              count: value,
              fill: `var(--chart-${index + 1})`
            }))}

            config={{
              male: {
                label: "Male",
                color: "var(--chart-1)",
              },
              not_specified: {
                label: "Not Specified",
                color: "var(--chart-2)",
              },
              female: {
                label: "Female",
                color: "var(--chart-3)",
              },
            }}
            dataKey="count"
            nameKey="gender"

          />

          <p className="text-xs text-muted-foreground">
            Total Users by Gender
          </p>
        </StatsCard>


        {/* Users by Role Card */}
        <StatsCard className="col-span-1   @4xl:col-span-6"
          title="Users by Role"
          Icon={<Briefcase className="inline-block mr-2 size-4" />}
        >
          <RoundedPieChart
            data={usersByRole.map((user, index) => ({
              role: user.role,
              count: user.count,
              fill: `var(--chart-${index + 1})`
            }))}

            config={{
              ...ROLES.reduce<
                Record<string, { label: string; color: string }>
              >((acc, role, idx) => {
                acc[role] = {
                  label: changeCase(role, "title"),
                  color: `var(--chart-${idx + 1})`,
                };
                return acc;
              }, {}),
            }}
            dataKey="count"
            nameKey="role"
          />
          <p className="text-xs text-muted-foreground">
            Total Users per Role
          </p>
        </StatsCard>

        {/* Users by Department Card */}
        <StatsCard
          className="col-span-1   @4xl:col-span-5"
          title="Users by Department"
          Icon={<Network className="inline-block mr-2 size-4" />}
        >
          <RoundedPieChart
            data={usersByDepartment.map((dept, index) => ({
              department: getDepartmentCode(dept.department) ?? dept.department,
              count: Number.parseInt(dept.count as unknown as string, 10),
              fill: `var(--chart-${index + 1})`
            }))}

            config={{
              ...DEPARTMENTS_LIST.reduce<
                Record<string, { label: string; color: string }>
              >((acc, dept, idx) => {
                acc[dept.code] = {
                  label: getDepartmentName(dept.code) ?? changeCase(dept.code, "title"),
                  color: `var(--chart-${idx + 1})`,
                };
                return acc;
              }, {}),
            }}
            dataKey="count"
            nameKey="department"
          />

          <p className="text-xs text-muted-foreground">
            Total Users per Department
          </p>
        </StatsCard>

      </div>
    </div>
  );
}

function cumulateStats(usersStats: UserCountAndGrowthResult, sessionsStats: SessionCountAndGrowthResult) {
  const allTimestamps = new Set([
    ...usersStats.graphData.map((d: any) => d.timestamp.getTime()),
    ...sessionsStats.graphData.map((d: any) => d.timestamp.getTime()),
  ])
  const userMap = new Map(
    usersStats.graphData.map((d: any) => [d.timestamp.getTime(), d.count])
  )
  const sessionMap = new Map(
    sessionsStats.graphData.map((d: any) => [d.timestamp.getTime(), d.count])
  )
  return Array.from(allTimestamps)
    .sort((a, b) => a - b)
    .map(timestamp => ({
      timestamp: new Date(timestamp),
      users: userMap.get(timestamp) || 0,
      sessions: sessionMap.get(timestamp) || 0,
    }))
}
