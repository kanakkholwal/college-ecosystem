import { HeaderBar } from "@/components/common/header-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, CalendarPlus, FileUp, PenLine } from "lucide-react";
import type { Metadata } from "next";
import { EventForm } from "../event-form";
import { dayFromParam } from "../event-form-schema";
import { ImportEvents } from "./import-events";

export const metadata: Metadata = { title: "New event | Admin Dashboard" };

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ time?: string; endDate?: string }>;
}) {
  const params = await searchParams;
  const startDate = dayFromParam(params.time);
  const endDate = dayFromParam(params.endDate);

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
        Icon={CalendarPlus}
        titleNode="New event"
        descriptionNode="Saved events appear on the public academic calendar straight away."
      />
      <Tabs defaultValue="single" className="flex flex-col gap-6">
        <TabsList className="h-10 self-start">
          <TabsTrigger value="single" className="h-8 gap-1.5">
            <PenLine className="size-4" aria-hidden="true" />
            One event
          </TabsTrigger>
          <TabsTrigger value="import" className="h-8 gap-1.5">
            <FileUp className="size-4" aria-hidden="true" />
            Import from a document
          </TabsTrigger>
        </TabsList>
        {/* Force-mounted so switching tabs never throws away a half-filled form. */}
        <TabsContent
          value="single"
          forceMount
          className="mt-0 data-[state=inactive]:hidden"
        >
          <EventForm
            mode="create"
            defaultValues={{
              startDate,
              hasEnd: !!endDate,
              endDate,
            }}
          />
        </TabsContent>
        <TabsContent value="import" className="mt-0">
          <ImportEvents />
        </TabsContent>
      </Tabs>
    </div>
  );
}
