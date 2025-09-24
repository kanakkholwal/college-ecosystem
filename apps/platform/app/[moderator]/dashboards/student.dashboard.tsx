import { NumberTicker } from "@/components/animation/number-ticker";
import { StatsCard } from "@/components/application/stats-card";
import { AnalyticsGrid } from "@/components/common/analytics";
import { ResponsiveContainer } from "@/components/common/container";
import { NoteSeparator } from "@/components/common/note-separator";
import { RouterCard } from "@/components/common/router-card";
import { Badge } from "@/components/ui/badge";
import { quick_links } from "@/constants/links";
import { getStudentDashboardData } from "~/actions/dashboard.student";

export default async function StudentDashboard({ role }: { role: string }) {
  const dashboardData = await getStudentDashboardData();

  const platformStats = [
    {
      label: "Community Posts",
      value: dashboardData.platformActivities?.communityPostsCount || 0,
    },
    {
      label: "Community Comments",
      value: dashboardData.platformActivities?.communityCommentsCount || 0,
    },
    {
      label: "Polls Created",
      value: dashboardData.platformActivities?.pollsCount || 0,
    },
    {
      label: "Announcements Made",
      value: dashboardData.platformActivities?.announcementsCount || 0,
    },
  ];

  return (
    <div className="space-y-8 my-5">
      {/* Academics + Hostel */}
      <NoteSeparator label="Academics & Hostel" />
      <ResponsiveContainer className="@5xl:grid-cols-3">
        <StatsCard title="Class Rank">
          <NumberTicker
            value={dashboardData?.result?.rank?.class || 0}
            className="text-3xl font-bold text-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your rank among students in your branch & year.
          </p>
        </StatsCard>

        <StatsCard title="Hostel Assigned">
          <h5 className="text-3xl font-bold text-primary">
            {dashboardData.hosteler?.hostelName ?? "Not Assigned"}
          </h5>
          <p className="text-xs text-muted-foreground mt-1">
            {dashboardData.hosteler
              ? `Room No: ${dashboardData.hosteler.roomNumber}`
              : "No room assigned yet"}
            {dashboardData.hosteler?.banned && (
              <Badge size="sm" variant="destructive_light" className="ml-2">
                Banned
              </Badge>
            )}
          </p>
          {!dashboardData.hosteler && (
            <p className="text-xs text-muted-foreground mt-1">
              Ask your MMCA or admin to assign a hostel.
            </p>
          )}
        </StatsCard>

        {dashboardData.hosteler && (
          <StatsCard title="Outpasses Issued">
            <NumberTicker
              value={dashboardData.outpassCount}
              className="text-3xl font-bold text-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Total outpasses issued from your hostel.
            </p>
          </StatsCard>
        )}
      </ResponsiveContainer>

      {/* Platform Activities */}
      <NoteSeparator label="Platform Activities" />
      <AnalyticsGrid stats={platformStats}  />

      {/* Quick Links */}
      <NoteSeparator label="Platform Quick Links" />
      <ResponsiveContainer id="quick_links">
        {quick_links.map((link, i) => (
          <RouterCard
            key={link.href}
            {...link}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </ResponsiveContainer>
    </div>
  );
}
