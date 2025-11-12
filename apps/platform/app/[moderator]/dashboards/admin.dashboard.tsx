import { NumberTicker } from "@/components/animation/number-ticker";
import {
  ChartBar,
  RoundedPieChart
} from "@/components/application/charts";
import { StatsCard } from "@/components/application/stats-card";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  CircleDashed,
  Eye,
  Network,
  Transgender,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { TbUsersGroup } from "react-icons/tb";
import {
  getActiveSessions,
  getPlatformDBStats,
  getUsersByDepartment,
  getUsersByGender,
  getUsersByRole,
  users_CountAndGrowth,
} from "~/actions/dashboard.admin";
import { ROLES } from "~/constants";
import {
  DEPARTMENTS_LIST,
  getDepartmentCode,
  getDepartmentName
} from "~/constants/core.departments";
import { extractVisitorCount } from "~/lib/third-party/github";
import { TimeInterval } from "~/utils/process";
import { changeCase } from "~/utils/string";

interface AdminDashboardProps {
  role?: string;
  searchParams: {
    period?: TimeInterval;
  }
}
export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const period = (searchParams?.period || "last_week") as TimeInterval;
  const result = await users_CountAndGrowth(period);
  const {
    totalUsers,
    growthPercent: userGrowth,
    growth,
    trend: userTrend,
  } = result;
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
    <div className="space-y-6 my-5">
      <div className="flex justify-between gap-2 w-full flex-col @4xl:flex-row divide-y @4xl:divide-x divide-border">
        <div className="w-full grid grid-cols-1 @lg:grid-cols-2 @4xl:grid-cols-12 gap-4 pr-1.5 @4xl:pr-0">
          {/* Total Users Card */}

          <StatsCard
            className="col-span-1   @4xl:col-span-4"
            title="Total Users"
            Icon={<Icon name="users" className="inline-block mr-2 size-4" />}
          >
            <NumberTicker
              value={totalUsers}
              className={cn(
                "text-3xl font-bold text-primary after:text-xs",
                userTrend === 1
                  ? "after:text-green-500"
                  : userTrend === -1
                    ? "after:text-red-500"
                    : "after:text-primary/80"
              )}
              suffix={
                userTrend === 1
                  ? "↑" + growth
                  : userTrend === -1
                    ? "↓" + growth
                    : ""
              }
            />

            <p className="text-xs text-muted-foreground">
              <span
                className={`${userTrend === 1
                  ? "text-green-500"
                  : userTrend === -1
                    ? "text-red-500"
                    : "text-primary/80"
                  } text-base`}
              >
                {userTrend === 1 ? (
                  <TrendingUp className="inline-block mr-2 size-4" />
                ) : userTrend === -1 ? (
                  <TrendingDown className="inline-block mr-2 size-4" />
                ) : (
                  <CircleDashed className="inline-block mr-2 size-4" />
                )}
                {userGrowth?.toFixed(2)}%
              </span>{" "}
              from {changeCase(period, "title")}
            </p>

          </StatsCard>

          {/* Active Sessions Card */}
          <StatsCard
            className="col-span-1   @4xl:col-span-4"
            title="Active Sessions"
            Icon={<TbUsersGroup className="inline-block mr-2 size-4" />}
          >
            <h4 className="text-3xl font-bold text-primary">
              {activeSessions}
            </h4>
            <p className="text-xs text-muted-foreground">
              Currently active sessions
            </p>
          </StatsCard>
          {/* Total Visitors Card */}
          <StatsCard
            className="col-span-1   @4xl:col-span-4"
            title="Total Visitors"
            Icon={<Eye className="inline-block mr-2 size-4" />}
          >
            <NumberTicker
              value={count}
              className="text-3xl font-bold text-primary"
            />
            <p className="text-xs text-muted-foreground">
              Total Visitors to the portal
            </p>
          </StatsCard>

          {/* Users by Gender Card */}

          <StatsCard className="col-span-1  @4xl:col-span-4"
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
          <StatsCard className="col-span-1   @4xl:col-span-4"
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
            className="col-span-1   @4xl:col-span-4"
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
          {/* platformDBStats */}
          <StatsCard className="col-span-1  @4xl:col-span-6 max-h-96"
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
      </div>
    </div>
  );
}
