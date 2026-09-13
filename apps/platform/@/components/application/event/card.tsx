import { cn } from "@/lib/utils";
import { ArrowUpRight, Clock, MapPin, Radio } from "lucide-react";
import {
  type EventLike,
  eventTypeLabel,
  formatEventTime,
  isHappeningNow,
} from "./format";

// z.string().url() accepts `javascript:` URLs, so only http(s) links render.
function safeLink(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return { href: parsed.href, label: parsed.hostname.replace(/^www\./, "") };
  } catch {
    return null;
  }
}

function EventCard({
  event,
  className,
  headingLevel = 3,
}: {
  event: EventLike;
  className?: string;
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 4 ? "h4" : "h3";
  const live = isHappeningNow(event);
  const type = eventTypeLabel(event.eventType);
  const links = (event.links ?? []).flatMap((url) => safeLink(url) ?? []);

  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border bg-card p-4 dark:bg-background",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Heading className="text-body-lg font-medium text-foreground">
          {event.title}
        </Heading>
        {type && (
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-caption text-muted-foreground">
            {type}
          </span>
        )}
      </div>

      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted-foreground">
        <span className="flex items-center gap-1.5 tabular-nums">
          <Clock className="size-3.5" aria-hidden="true" />
          {formatEventTime(event)}
        </span>
        {event.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden="true" />
            {event.location}
          </span>
        )}
        {live && (
          <span className="flex items-center gap-1.5 font-medium text-success">
            <Radio className="size-3.5" aria-hidden="true" />
            Happening now
          </span>
        )}
      </p>

      {event.description && (
        <p className="line-clamp-3 text-body text-muted-foreground">
          {event.description}
        </p>
      )}

      {links.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 rounded-sm text-body font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

EventCard.displayName = "EventCard";

export { EventCard };
