import { Panel } from "@/components/application/dashboard/primitives";
import { EventCard } from "@/components/application/event/card";
import {
  EVENT_TIME_ZONE,
  eventStatus,
  eventTypeLabel,
} from "@/components/application/event/format";
import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, CalendarDays, Pencil } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getEventById } from "~/actions/common.events";
import { DeleteEventButton } from "../event-actions";
import { EventStatusTag } from "../event-status";

type Props = { params: Promise<{ id: string }> };

const loadEvent = cache(getEventById);

const fullDate = new Intl.DateTimeFormat("en-IN", {
  timeZone: EVENT_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const clock = new Intl.DateTimeFormat("en-IN", {
  timeZone: EVENT_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const stamp = new Intl.DateTimeFormat("en-IN", {
  timeZone: EVENT_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

const moment = (value: Date | string) => {
  const date = new Date(value);
  return `${fullDate.format(date)}, ${clock.format(date).toUpperCase()} IST`;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await loadEvent((await params).id);
  return { title: event ? `${event.title} | Events` : "Event not found" };
}

export default async function EventPage({ params }: Props) {
  const event = await loadEvent((await params).id);
  if (!event) notFound();

  const status = eventStatus(event);
  const type = eventTypeLabel(event.eventType);
  const details: { label: string; value: React.ReactNode }[] = [
    { label: "Starts", value: moment(event.time) },
    {
      label: "Ends",
      value: event.endDate ? moment(event.endDate) : "No end set",
    },
    { label: "Type", value: type || "Not set" },
    { label: "Location", value: event.location || "Not decided" },
    {
      label: "Last updated",
      value: event.updatedAt
        ? `${stamp.format(new Date(event.updatedAt))} IST`
        : "Unknown",
    },
  ];

  return (
    <div className="@container flex flex-col gap-8">
      <div>
        <ButtonLink
          href="/admin/events"
          variant="ghost"
          size="sm"
          className="-ml-3"
        >
          <ArrowLeft aria-hidden="true" />
          All events
        </ButtonLink>
      </div>
      <HeaderBar
        Icon={CalendarDays}
        titleNode={event.title}
        descriptionNode={
          <span className="flex flex-wrap items-center gap-2">
            <EventStatusTag status={status} />
            {type}
          </span>
        }
        actionNode={
          <>
            <DeleteEventButton event={{ id: event.id, title: event.title }} />
            <ButtonLink
              href={`/admin/events/${event.id}/edit`}
              variant="primary"
            >
              <Pencil aria-hidden="true" />
              Edit
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 @4xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel as="section" className="flex flex-col gap-4">
          <h2 className="text-body-lg font-medium text-foreground">
            Schedule and details
          </h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 @xl:grid-cols-2">
            {details.map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <dt className="text-caption text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="text-body text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <h3 className="text-caption text-muted-foreground">Description</h3>
            <p className="whitespace-pre-wrap text-body leading-relaxed text-foreground">
              {event.description || "No description yet."}
            </p>
          </div>
        </Panel>

        <Panel as="section" className="flex flex-col gap-3">
          <div className="space-y-1">
            <h2 className="text-body-lg font-medium text-foreground">
              Calendar preview
            </h2>
            <p className="text-body text-muted-foreground">
              As shown on the public academic calendar.
            </p>
          </div>
          <EventCard event={event} />
          <ButtonLink
            href="/academic-calendar"
            target="_blank"
            rel="noopener"
            variant="outline"
            size="sm"
            className="self-start"
          >
            Open public calendar
            <span className="sr-only">(opens in a new tab)</span>
          </ButtonLink>
        </Panel>
      </div>
    </div>
  );
}
