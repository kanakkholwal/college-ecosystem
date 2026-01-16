"use client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { rawEventsSchemaType } from "~/constants/common.events";
import type { EventJSONType } from "~/models/events";
import { Badge } from "../ui/badge";

function EventCard({
  event,
  className,
}: {
  event: EventJSONType | rawEventsSchemaType;
  className?: string;
}) {
  const time = new Date(event.time);
  const isAllDayEvent = time.getHours() === 0 && time.getMinutes() === 0;
  const isGoingEvent =
    event.endDate &&
    new Date(event.endDate) > new Date() &&
    new Date(event.time) <= new Date();
  return (
    <div
      className={cn(
        "rounded-lg p-2 bg-card/80 border border-border/50 hover:shadow hover:bg-card hover:border-border transition-all",
        className
      )}
    >
      <h3 className="text-sm font-medium">{event.title}</h3>
      <p className="text-xs text-muted-foreground">
        {isAllDayEvent ? "All Day" : format(time, "hh:mm a")}{" "}
        {event.endDate && ` - ${format(new Date(event.endDate), "hh:mm a")}`}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
      <p>
        {isGoingEvent && (
          <Badge variant="success" appearance="ghost" size="sm">
            Going
          </Badge>
        )}
        {event.location && (
          <Badge variant="default" size="sm">
            {event.location}
          </Badge>
        )}
      </p>
    </div>
  );
}

EventCard.displayName = "EventCard";

export { EventCard };

