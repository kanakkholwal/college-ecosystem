import { ResponsiveContainer } from "@/components/common/container";
import EmptyArea from "@/components/common/empty-area";
import { RouterCard } from "@/components/common/router-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getHostelRoutes } from "@/constants/links";
import { cn } from "@/lib/utils";
import {
  Clock,
  DoorOpen,
  LogOut,
  Users
} from "lucide-react";
import { getHostelByUser } from "~/actions/hostel.core";
import { getWardenDashboardStats } from "~/actions/warden.dashboard";
import { HostelCookieSetter } from "./dashboard.client";


export default async function WardenDashboard({ role }: { role: string }) {
  const { success, message, hostel, hosteler } = await getHostelByUser();

  if (!success || !hostel) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyArea
          icons={[DoorOpen]}
          title="No Assignment Found"
          description={message || "You are not assigned to any hostel yet."}
        />
      </div>
    );
  }

  // Fetch Stats
  const statsRes = await getWardenDashboardStats(hostel?.slug || "");
  const stats = statsRes.data || {
    pendingOutpasses: 0,
    activeOutpasses: 0,
    totalStudents: 0
  };

  return (
    <div className="space-y-8 pb-20">
      <HostelCookieSetter hostelSlug={hostel.slug} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="uppercase tracking-wider font-bold text-[10px] text-primary border-primary/20 bg-primary/5">
              {hostel.gender} Hostel
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              #{hostel.slug.toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{hostel.name}</h1>
          <p className="text-muted-foreground text-sm">Warden Dashboard</p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-border/60 bg-card shadow-sm">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {hostel.warden.name.charAt(0)}
          </div>
          <div className="text-xs">
            <p className="font-semibold">{hostel.warden.name}</p>
            <p className="text-muted-foreground">Chief Warden</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Pending Reviews"
          value={stats.pendingOutpasses}
          icon={Clock}
          color="text-orange-500"
          trend="Requires attention"
        />
        <StatCard
          label="Students Out"
          value={stats.activeOutpasses}
          icon={LogOut}
          color="text-blue-500"
          trend="Currently off-campus"
        />
        <StatCard
          label="Total Residents"
          value={stats.totalStudents}
          icon={Users}
          color="text-foreground"
          trend="Occupancy"
        />
      </div>

      <Separator className="opacity-50" />

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
          Operations
        </h2>
        <ResponsiveContainer>
          {getHostelRoutes(role, hostel.slug).map((route) => (
            <RouterCard
              key={route.href}
              Icon={route.Icon}
              title={route.title}
              description={route.description}
              href={route.href}
              disabled={route?.disabled}
            />
          ))}
        </ResponsiveContainer>
      </section>


    </div>
  );
}


interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  trend: string;
}
function StatCard({ label, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <Card className="border-border/50 shadow-sm bg-card/50">
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="text-3xl font-bold mt-2 tabular-nums">{value}</h3>
          <p className="text-xs text-muted-foreground/60 mt-1">{trend}</p>
        </div>
        <div className={cn("p-2.5 rounded-xl bg-background border shadow-sm", color)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}
