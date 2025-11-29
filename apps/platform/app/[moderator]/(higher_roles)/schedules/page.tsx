import { ResponsiveContainer } from "@/components/common/container";
import EmptyArea from "@/components/common/empty-area";
import { HeaderBar } from "@/components/common/header-bar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  Calendar,
  CalendarDays,
  Clock,
  Layers,
  Plus,
  Settings2
} from "lucide-react";
import Link from "next/link";
import { getAllTimeTables } from "~//actions/common.time-table";
import { TimeTableWithID } from "~/models/time-table";

export default async function Schedules(props: {
  params: Promise<{
    moderator: string;
  }>;
}) {
  const timetables = await getAllTimeTables();
  const params = await props.params;

  return (
    <div className="min-h-screen bg-background pb-20">
      <HeaderBar
        Icon={CalendarDays}
        titleNode={
          <div className="flex items-center gap-3">
            <span>Manage Timetables</span>
            <Badge variant="default" className="px-2 h-6 rounded-md text-xs font-mono">
              {timetables.length}
            </Badge>
          </div>
        }
        descriptionNode="Configure academic schedules, manage sections, and publish updates."
        actionNode={
          <ButtonLink
            variant="default"
            size="sm"
            effect="shineHover"
            href={`/${params.moderator}/schedules/create`}
            className="h-9 px-4 shadow-md shadow-primary/20"
          >
            <Plus className="mr-2 size-4" />
            Create Schedule
          </ButtonLink>
        }
      />

      {timetables.length === 0 ? (
        <div className="mt-8 px-4">
            <EmptyArea
            title="No Timetables Configured"
            description="Get started by creating a master schedule for a specific year and department."
            icons={[Calendar, Layers, Plus]}
            actionProps={{
                variant: "outline",
                href: `/${params.moderator}/schedules/create`,
                className: cn("mt-4"),
                children: (<>
                    <Plus className="mr-2 size-4" /> Create First Timetable
                </>),
            }}
            />
        </div>
      ) : (
        <ResponsiveContainer className="mt-8">
            {timetables.map((timetable, i) => {
              // Construct the view URL
              const href = `/${params.moderator}/schedules/${timetable.department_code}/${timetable.year}/${timetable.semester}`;
              
              return (
                <TimetableCard 
                    key={timetable._id} 
                    timetable={timetable} 
                    href={href} 
                    index={i} 
                />
              );
            })}
        </ResponsiveContainer>
      )}
    </div>
  );
}


function TimetableCard({ timetable, href, index }: { timetable: Partial<TimeTableWithID>, href: string, index: number }) {
    return (
        <Link
            href={href}
            className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Header: Icon & Title */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Calendar className="size-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                            {timetable.sectionName || "Untitled Section"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {timetable.department_code}
                        </p>
                    </div>
                </div>
                
                {/* Edit Action */}
                <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <div className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                        <Settings2 className="size-4" />
                    </div>
                </div>
            </div>

            {/* Body: Metadata Chips */}
            <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-background/50 text-muted-foreground border-border/60">
                    Year {timetable.year}
                </Badge>
                <div className="w-px h-5 bg-border/60" />
                <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-background/50 text-muted-foreground border-border/60">
                    Sem {timetable.semester}
                </Badge>
            </div>

            {/* Footer: Timestamp & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                    <Clock className="size-3" />
                    <span>
                        Updated {formatDistanceToNow(new Date(timetable.updatedAt || new Date()), { addSuffix: true })}
                    </span>
                </div>
                
                <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details <ArrowUpRight className="size-3" />
                </div>
            </div>
        </Link>
    );
}