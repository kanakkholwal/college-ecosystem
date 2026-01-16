import { ActionButton } from "@/components/application/action-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ButtonLink, PreviousPageLink } from "@/components/utils/link";
import { format } from "date-fns";
import { AlertTriangle, CalendarDays, Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { deleteEvent, getEventById } from "~/actions/common.events";

export default async function EventPage(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const params = await props.params;
  const event = await getEventById(params.id);
  if (!event) {
    return notFound();
  }

  const startDate = new Date(event.time);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* 1. Header and Actions */}
      <div className="border-b pb-6 space-y-4">
        <PreviousPageLink className="text-muted-foreground hover:text-foreground transition-colors" />

        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {event.title}
            </h1>
            <p className="text-xl text-primary font-semibold">
              {event.location || "Online / To Be Announced"}
            </p>
          </div>

          <div className="flex gap-3">
            <ButtonLink
              variant="outline"
              size="sm"
              href={`/admin/events/${event.id}/edit`}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" /> Edit Event
            </ButtonLink>
          </div>
        </div>
      </div>
      
      {/* 2. Main Grid: Description vs. Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2/3): Description & Primary Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Event Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {event.description || "No detailed description provided."}
              </p>
            </CardContent>
          </Card>
          
          {/* Add future sections here (e.g., Attendee List, Links) */}
        </div>
        
        {/* Right Column (1/3): Metadata & Danger Zone */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Metadata Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Start Time */}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Starts</p>
                  <p className="font-semibold">{format(startDate, "dd MMM yyyy")}</p>
                  <p className="text-sm text-foreground/80">{format(startDate, "hh:mm a")}</p>
                </div>
              </div>

              <Separator />

              {/* End Time (Conditional) */}
              {endDate && (
                <>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Ends</p>
                      <p className="font-semibold">{format(endDate, "dd MMM yyyy")}</p>
                      <p className="text-sm text-foreground/80">{format(endDate, "hh:mm a")}</p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Location (Conditional) */}
              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Location</p>
                    <p className="font-semibold text-foreground/90">{event.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Permanently Delete
              </CardTitle>
              <CardDescription>
                This action is irreversible and will remove the event from all calendars.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActionButton
                variant="destructive"
                size="sm"
                actionName="Event Deletion"
                loadingLabel="Deleting event..."
                action={deleteEvent.bind(null, event.id)}
                className="w-full justify-center"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Event
              </ActionButton>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}