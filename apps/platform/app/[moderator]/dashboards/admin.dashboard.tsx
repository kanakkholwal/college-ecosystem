import { NumberTicker } from "@/components/animation/number-ticker";
import {
  ChartBar,
  ChartPie,
  ChartRadialStacked,
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
} from "~/constants/core.departments";
import { extractVisitorCount } from "~/lib/third-party/github";
import { formatNumber } from "~/utils/number";
import { changeCase } from "~/utils/string";

export default async function AdminDashboard() {
  const {
    total: totalUsers,
    growthPercent: userGrowth,
    growth,
    trend: userTrend,
  } = await users_CountAndGrowth("last_week");

  const usersByGender = await getUsersByGender();
  const usersByRole = await getUsersByRole();
  const usersByDepartment = await getUsersByDepartment();
  const activeSessions = await getActiveSessions();
  const count = await extractVisitorCount();
  const platformDBStats = await getPlatformDBStats();

  return (
    <div className="space-y-6 my-5">
      <div className="flex justify-between gap-2 w-full flex-col @4xl:flex-row divide-y @4xl:divide-x divide-border">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 pr-1.5 @4xl:pr-0">
          {/* Total Users Card */}

          <StatsCard
            className="col-span-1 sm:col-span-2 md:col-span-4"
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
                className={`${
                  userTrend === 1
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
              from last month
            </p>
          </StatsCard>

          {/* Active Sessions Card */}
          <StatsCard
            className="col-span-1 sm:col-span-2 md:col-span-4"
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
          {/* Total count Card */}
          <StatsCard
            className="col-span-1 sm:col-span-2 md:col-span-4"
            title="Total count"
            Icon={<Eye className="inline-block mr-2 size-4" />}
          >
            <NumberTicker
              value={count}
              className="text-3xl font-bold text-primary"
            />
            <p className="text-xs text-muted-foreground">
              Total count to the portal
            </p>
          </StatsCard>
          {/* platformDBStats */}
          <StatsCard
            className="col-span-1 sm:col-span-2 md:col-span-12 max-h-96"
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
          {/* Users by Gender Card */}
          <StatsCard
            className="col-span-1 sm:col-span-2 md:col-span-6"
            title="Users by Gender"
            Icon={<Transgender className="inline-block mr-2 size-4" />}
          >
            <ChartRadialStacked
              data={Object.entries(usersByGender).map(([key, value]) => {
                return { key, count: value };
              })}
              config={{
                count: {
                  label: "Gender",
                },
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
              nameKey="key"
              textLabel="Total Users"
              textValue={formatNumber(totalUsers)}
              className="mt-auto max-h-96"
            />

            <p className="text-xs text-muted-foreground">
              Total Users by Gender
            </p>
          </StatsCard>

          {/* Users by Role Card */}
          <StatsCard
            className="col-span-1 sm:col-span-2 md:col-span-6"
            title="Users by Role"
            Icon={<Briefcase className="inline-block mr-2 size-4" />}
          >
            <ChartPie
              data={usersByRole}
              className="max-h-96 mt-auto"
              config={{
                count: {
                  label: "Role",
                },

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
              innerRadius={0}
              showLabelList={true}
            />
            <p className="text-xs text-muted-foreground">
              Total Users per Role
            </p>
          </StatsCard>

          {/* Users by Department Card */}
          <StatsCard
            className="col-span-1 sm:col-span-2 md:col-span-12"
            title="Users by Department"
            Icon={<Network className="inline-block mr-2 size-4" />}
          >
            <ChartBar
              className="max-h-96"
              data={usersByDepartment.map((dept) => ({
                department: getDepartmentCode(dept.department),
                count: dept.count,
              }))}
              config={{
                staff: {
                  label: "Staff",
                  color: "var(--chart-1)",
                },

                ...DEPARTMENTS_LIST.reduce<
                  Record<string, { label: string; color: string }>
                >((acc, dept, idx) => {
                  acc[dept.code] = {
                    label: dept.name,
                    color: `var(--chart-${idx + 1})`,
                  };
                  return acc;
                }, {}),
                count: {
                  label: "count",
                },
              }}
              dataKey="count"
              nameKey="department"
            />
            <p className="text-xs text-muted-foreground">
              Total Users per Department
            </p>
          </StatsCard>
          {/* Account Creation Trends */}
        </div>
      </div>
    </div>
  );
}
