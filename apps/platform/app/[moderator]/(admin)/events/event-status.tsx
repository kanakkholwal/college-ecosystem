import type { EventStatus } from "@/components/application/event/format";
import { cn } from "@/lib/utils";
import { CalendarClock, History, Radio } from "lucide-react";

const STATUS = {
  upcoming: { label: "Upcoming", Icon: CalendarClock, tone: "text-foreground" },
  ongoing: { label: "Ongoing", Icon: Radio, tone: "text-success" },
  past: { label: "Past", Icon: History, tone: "text-muted-foreground" },
} as const;

export function EventStatusTag({
  status,
  className,
}: {
  status: EventStatus;
  className?: string;
}) {
  const { label, Icon, tone } = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-border px-2 text-caption font-medium",
        tone,
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
