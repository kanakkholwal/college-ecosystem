import {
  RouterCard,
  type RouterCardLink,
} from "@/components/common/router-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import {
  CalendarDays,
  CalendarPlus,
  DoorOpen,
  Edit3,
  Megaphone,
  Users
} from "lucide-react";
import Link from "next/link";
import { getInfo } from "~/actions/dashboard.cr";
import { TimeTableWithID } from "~/models/time-table";

export default async function CRDashboard() {
  const { studentInfo, timetables, stats } = await getInfo();

  // 1. Static Action Cards
  const actionLinks: RouterCardLink[] = [
    {
      href: "/cr/schedules/create",
      title: "Create Schedule",
      description: "Draft a new timetable for the upcoming semester.",
      Icon: CalendarPlus,
    },
    {
      href: "/cr/classroom", // Assuming this route exists based on your project description
      title: "Update Room Status",
      description: "Mark a classroom as occupied or free in real-time.",
      Icon: DoorOpen,
    },
    {
      href: "/cr/announcements/create",
      title: "Broadcast",
      description: "Post a notification to your batch's feed.",
      Icon: Megaphone,
    },
  ];

  return (
    <>
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Representative</h1>
          <p className="text-muted-foreground mt-1">
            Manage logistics for {studentInfo.departmentCode} • Year {studentInfo.currentYear}
          </p>
        </div>
        <div className="flex gap-2">
            <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
                {stats.totalSchedules} Active Schedules
            </Badge>
        </div>
      </div>

      <Separator />

      {/* --- Quick Actions Grid (Bento Top) --- */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionLinks.map((link, i) => (
            <RouterCard
              key={link.href}
              {...link}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </section>

      {/* --- Managed Timetables Section --- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Managed Timetables
            </h2>
             {stats.lastUpdated && (
                <span className="text-xs text-muted-foreground">
                    Last activity {formatDistanceToNow(new Date(stats.lastUpdated))} ago
                </span>
            )}
        </div>

        {timetables.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetables.map((t, i) => (
              <TimetableCard key={t._id} timetable={t} index={i} />
            ))}
          </div>
        ) : (
            // Empty State
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/20">
            <CalendarDays className="size-10 text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-foreground">No Schedules Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start by creating a master timetable for your section.
            </p>
            <Link 
                href="/cr/schedules/create"
                className="text-sm font-medium text-primary hover:underline"
            >
                Create your first schedule &rarr;
            </Link>
          </div>
        )}
      </section>

    </>
  );
}

// --- Sub-component: Specific Design for Timetables ---
function TimetableCard({ timetable, index }: { timetable: TimeTableWithID; index: number }) {
  return (
    <div 
        className="group relative flex flex-col justify-between p-5 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        style={{ animationDelay: `${index * 100}ms` }} // Stagger effect
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="size-5" />
          </div>
          <Link href={`/cr/schedules/edit/${timetable._id}`}>
            <Edit3 className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
        </div>

        <h3 className="font-semibold text-lg">{timetable.sectionName}</h3>
        <p className="text-sm text-muted-foreground">
           Sem {timetable.semester} • {timetable.department_code}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
           <Users className="size-3" />
           <span>Year {timetable.year}</span>
        </div>
        <Link 
            href={`/cr/schedules/view/${timetable._id}`}
            className="text-xs font-medium text-foreground group-hover:text-primary transition-colors"
        >
            View Details &rarr;
        </Link>
      </div>
    </div>
  );
}