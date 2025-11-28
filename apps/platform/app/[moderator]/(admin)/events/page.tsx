import EmptyArea from "@/components/common/empty-area";
import { HeaderBar } from "@/components/common/header-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  MoreHorizontal,
  Plus
} from "lucide-react";
import Link from "next/link";
import { getEvents } from "~/actions/common.events";

type Props = {
  params: Promise<{
    moderator: string;
  }>;
  searchParams: Promise<{
    query?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function ManageEventsPage(props: Props) {
  const searchParams = await props.searchParams;

  // Defaults: from today to 1 year ahead
  const groupedEvents = await getEvents({
    query: searchParams.query || "",
    from: searchParams.from ? new Date(searchParams.from) : new Date(),
    to: searchParams.to
      ? new Date(searchParams.to)
      : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  });

  const totalEvents = groupedEvents.flatMap((group) => group.events).length;

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* 1. Header */}
      <HeaderBar
        Icon={CalendarDays}
        titleNode={
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Event Schedule</h1>
            <Badge variant="default" className="rounded-full px-2.5">
              {totalEvents} Upcoming
            </Badge>
          </div>
        }
        descriptionNode="Plan and manage academic and extracurricular activities."
        actionNode={
          <div className="flex items-center gap-2">
            <ButtonLink
              variant="outline"
              size="sm"
              href="/academic-calendar"
              target="_blank"
              className="hidden sm:flex gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Public Calendar
            </ButtonLink>
            <ButtonLink
              variant="default"
              size="sm"
              href={`/admin/events/new`}
              className="gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </ButtonLink>
          </div>
        }
      />

      {/* 2. Timeline Content */}
      <div className="max-w-4xl mx-auto">
        {groupedEvents.length > 0 ? (
          <div className="space-y-8 pl-4 sm:pl-0">
            {groupedEvents.map((group, groupIdx) => {
              const date = new Date(group.day);
              const isTodayDate = isToday(date);

              return (
                <div key={`group-${groupIdx}`} className="relative">
                  {/* Sticky Date Header */}
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-4 flex items-center gap-4">
                    <div className={cn(
                        "h-3 w-3 rounded-full border-2",
                        isTodayDate ? "bg-primary border-primary" : "bg-background border-muted-foreground/30"
                    )} />
                    <h3 className={cn(
                        "text-sm font-semibold uppercase tracking-wider",
                        isTodayDate ? "text-primary" : "text-muted-foreground"
                    )}>
                      {isTodayDate ? "Today, " : ""}{format(date, "EEEE, MMMM do")}
                    </h3>
                    <div className="h-px bg-border flex-1" />
                  </div>

                  {/* Events List for this Day */}
                  <div className="ml-1.5 border-l-2 border-border/40 pl-8 pb-4 space-y-4">
                    {group.events.map((event) => (
                      <div 
                        key={event.id} 
                        className="group relative bg-card hover:bg-muted/40 border rounded-xl p-4 transition-all hover:shadow-sm hover:border-primary/20"
                      >
                        {/* Connecting Dot */}
                        <div className="absolute -left-[39px] top-6 h-2 w-2 rounded-full bg-border group-hover:bg-primary transition-colors" />

                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                            <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(event.time), "hh:mm a")}
                                </div>
                                <h4 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                                    {event.title}
                                </h4>
                                {event.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                        {event.description}
                                    </p>
                                )}
                                {/* Optional: Location if you have it in schema */}
                                {/* <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                                    <MapPin className="h-3 w-3" /> Campus Auditorium
                                </div> */}
                            </div>

                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2"
                                asChild
                            >
                                <Link href={`/admin/events/${event.id}`}>
                                    Edit Details <MoreHorizontal className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyArea
            title="No Events Scheduled"
            description="Your calendar is clear for this period."
            icons={[CalendarDays]}
            className="py-20 border-dashed"
          />
        )}
      </div>
    </div>
  );
}