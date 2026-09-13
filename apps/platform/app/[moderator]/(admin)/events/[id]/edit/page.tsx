import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventById } from "~/actions/common.events";
import { EventForm } from "../../event-form";
import { eventToFormValues } from "../../event-form-schema";

export const metadata: Metadata = { title: "Edit event | Admin Dashboard" };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const event = await getEventById((await params).id);
  if (!event) notFound();

  return (
    <div className="@container flex flex-col gap-8">
      <div>
        <ButtonLink
          href={`/admin/events/${event.id}`}
          variant="ghost"
          size="sm"
          className="-ml-3"
        >
          <ArrowLeft aria-hidden="true" />
          Back to event
        </ButtonLink>
      </div>
      <HeaderBar
        Icon={Pencil}
        titleNode="Edit event"
        descriptionNode={`Changes to "${event.title}" go live on the public calendar when you save.`}
      />
      <EventForm
        mode="edit"
        eventId={event.id}
        defaultValues={eventToFormValues(event)}
      />
    </div>
  );
}
