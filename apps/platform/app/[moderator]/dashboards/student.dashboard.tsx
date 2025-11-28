import { NumberTicker } from "@/components/animation/number-ticker";
import { StatsCard } from "@/components/application/stats-card";
import { AnalyticsGrid } from "@/components/common/analytics";
import { RouterCard } from "@/components/common/router-card";
import { Badge } from "@/components/ui/badge";
import { quick_links } from "@/constants/links";
import { BedDouble, LayoutGrid, Link2, Ticket, Trophy } from "lucide-react";
import { getStudentDashboardData } from "~/actions/dashboard.student";

export default async function StudentDashboard({ role }: { role: string }) {
  const dashboardData = await getStudentDashboardData();

  const platformStats = [
    {
      label: "Community Posts",
      value: dashboardData.platformActivities?.communityPostsCount || 0,
    },
    {
      label: "Discussions", // Shortened for UI fit
      value: dashboardData.platformActivities?.communityCommentsCount || 0,
    },
    {
      label: "Polls Created",
      value: dashboardData.platformActivities?.pollsCount || 0,
    },
    {
      label: "Announcements",
      value: dashboardData.platformActivities?.announcementsCount || 0,
    },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-10 py-8 px-4 sm:px-6">
      
      {/* SECTION 1: HERO STATS (Bento Layout) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
           <LayoutGrid className="size-5 text-muted-foreground" />
           <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Rank Card - Takes prominence */}
          <StatsCard 
            title="Class Rank" 
            Icon={Trophy}
            description="Your standing within your batch & branch."
            className="lg:col-span-1"
          >
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-extrabold tracking-tighter text-foreground">#</span>
              <NumberTicker
                value={dashboardData?.result?.rank?.class || 0}
                className="text-5xl font-extrabold tracking-tighter text-primary"
              />
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-2">
              Top {(Math.random() * 10).toFixed(1)}% of class {/* Placeholder logic or add real data */}
            </p>
          </StatsCard>

          {/* Hostel Card - Handles Banned State visually */}
          <StatsCard 
            title="Hostel Status" 
             Icon={BedDouble}
            variant={dashboardData.hosteler?.banned ? "destructive" : "default"}
            description={dashboardData.hosteler ? "Your current residence." : "No hostel assigned."}
            className="lg:col-span-1"
          >
            {dashboardData.hosteler ? (
              <div className="mt-2 space-y-1">
                <h5 className="text-2xl font-bold truncate">
                  {dashboardData.hosteler.hostelName}
                </h5>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      <span className="font-medium">Room:</span> 
                      {dashboardData.hosteler.roomNumber}
                   </div>
                   {dashboardData.hosteler?.banned && (
                    <Badge variant="destructive" className="animate-pulse">
                      Banned
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center h-full min-h-[60px]">
                 <p className="text-sm text-muted-foreground">Contact admin for allotment.</p>
              </div>
            )}
          </StatsCard>

          {/* Outpass Card */}
          {dashboardData.hosteler && (
            <StatsCard 
              title="Outpasses" 
               Icon={Ticket}
              description="Total approved exits this semester."
              className="lg:col-span-1"
            >
              <div className="mt-2">
                <NumberTicker
                  value={dashboardData.outpassCount}
                  className="text-4xl font-bold tracking-tighter"
                />
                <span className="text-muted-foreground ml-2">issued</span>
              </div>
            </StatsCard>
          )}
        </div>
      </section>

      {/* SECTION 2: ACTIVITY GRID */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">
          Activity
        </h2>
        <AnalyticsGrid stats={platformStats} />
      </section>

      {/* SECTION 3: QUICK LINKS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
           <Link2 className="size-5 text-muted-foreground" />
           <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quick_links.map((link, i) => (
            <RouterCard
              key={link.href}
              {...link}
              // Assuming RouterCard accepts className, if not, wrap it
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}