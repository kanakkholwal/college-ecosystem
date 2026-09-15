"use client";

import { Panel } from "@/components/application/dashboard/primitives";
import { EventCard } from "@/components/application/event/card";
import {
  EVENT_TIME_ZONE,
  eventTypeLabel,
  parseDayKey,
} from "@/components/application/event/format";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ButtonLink } from "@/components/utils/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, TriangleAlert, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import {
  type Control,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import toast from "@/lib/toast";
import { createNewEvent, updateEvent } from "~/actions/common.events";
import { eventTypes } from "~/constants/common.events";
import { callAction } from "~/lib/call-action";
import {
  EMPTY_EVENT_FORM,
  type EventFormValues,
  editEventFormSchema,
  eventFormSchema,
  isHttpUrl,
  toEventPayload,
} from "./event-form-schema";

const LINK_LIMIT = 5;
const LEAVE_MESSAGE =
  "You have unsaved changes. Leave this page and lose them?";

function useUnsavedChangesGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    // App Router has no navigation events, so in-app links are intercepted before next/link sees them.
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (
        anchor.target === "_blank" ||
        anchor.origin !== window.location.origin
      )
        return;
      if (anchor.pathname === window.location.pathname) return;
      if (!window.confirm(LEAVE_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [active]);
}

export function EventForm({
  mode,
  eventId,
  defaultValues,
}: {
  mode: "create" | "edit";
  eventId?: string;
  defaultValues?: Partial<EventFormValues>;
}) {
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const form = useForm<EventFormValues>({
    resolver: zodResolver(
      mode === "edit" ? editEventFormSchema : eventFormSchema
    ),
    defaultValues: { ...EMPTY_EVENT_FORM, ...defaultValues },
    mode: "onTouched",
  });
  const links = useFieldArray({ control: form.control, name: "links" });
  const [allDay, hasEnd, startDate] = useWatch({
    control: form.control,
    name: ["allDay", "hasEnd", "startDate"],
  });
  const { isDirty, isSubmitting, errors } = form.formState;
  const pending = isSubmitting || navigating;
  const backHref =
    mode === "edit" && eventId ? `/admin/events/${eventId}` : "/admin/events";

  useUnsavedChangesGuard(isDirty && !pending);

  async function onSubmit(values: EventFormValues) {
    const payload = toEventPayload(values);
    const res = await callAction(() =>
      mode === "edit" && eventId
        ? updateEvent(eventId, payload)
        : createNewEvent(payload)
    );
    if (!res.ok) {
      form.setError("root", { message: res.error });
      return;
    }
    const id = eventId ?? res.data.id;
    form.reset(values);
    toast.success(mode === "edit" ? "Changes saved" : "Event published");
    startTransition(() => router.push(`/admin/events/${id}`));
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="grid grid-cols-1 items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <FormSection
            title="Details"
            description="What people see first on the calendar."
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mid-semester exams"
                      autoComplete="off"
                      maxLength={120}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger onBlur={field.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {eventTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={4} className="resize-y" {...field} />
                  </FormControl>
                  <FormDescription>
                    The calendar card shows the first three lines.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection
            title="Date and time"
            description={
              <>
                Enter times in India Standard Time (IST, UTC+05:30).{" "}
                <ZoneNotice />
              </>
            }
          >
            <SwitchField
              control={form.control}
              name="allDay"
              label="All day"
              onToggle={() => form.clearErrors(["startTime", "endTime"])}
            />
            <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                rules={{ deps: ["endDate", "endTime"] }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!allDay && (
                <FormField
                  control={form.control}
                  name="startTime"
                  rules={{ deps: ["endTime"] }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start time (IST)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <SwitchField
              control={form.control}
              name="hasEnd"
              label="Add an end date"
              description="For events that run over several hours or days."
              onToggle={() => form.clearErrors(["endDate", "endTime"])}
            />
            {hasEnd && (
              <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={startDate || undefined}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!allDay && (
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End time (IST)</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          </FormSection>

          <FormSection title="Location">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Where{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Lecture Hall 1, or Online"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank if the venue isn't decided yet.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection
            title="Visibility and links"
            description="Saved events are public: anyone can see them on the academic calendar, signed in or not."
          >
            {links.fields.length > 0 && (
              <ul className="flex flex-col gap-3">
                {links.fields.map((item, index) => (
                  <li key={item.id}>
                    <FormField
                      control={form.control}
                      name={`links.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link {index + 1}</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                type="url"
                                inputMode="url"
                                placeholder="https://nith.ac.in/notice.pdf"
                                autoComplete="off"
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => links.remove(index)}
                              aria-label={`Remove link ${index + 1}`}
                            >
                              <X />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </li>
                ))}
              </ul>
            )}
            {links.fields.length < LINK_LIMIT && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => links.append({ url: "" })}
              >
                <Plus />
                Add a link
              </Button>
            )}
          </FormSection>

          {errors.root?.message && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-card p-4 dark:bg-background"
            >
              <TriangleAlert
                className="mt-0.5 size-5 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <p className="text-body text-foreground">{errors.root.message}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
            <ButtonLink href={backHref} variant="outline">
              Cancel
            </ButtonLink>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Save aria-hidden="true" />
              )}
              {pending
                ? "Saving"
                : mode === "edit"
                  ? "Save changes"
                  : "Publish event"}
            </Button>
          </div>
        </div>

        <aside className="@4xl:sticky @4xl:top-4">
          <EventPreview control={form.control} />
        </aside>
      </form>
    </Form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background"
    >
      <div className="space-y-1">
        <h2 id={id} className="text-body-lg font-medium text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-body text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function SwitchField({
  control,
  name,
  label,
  description,
  onToggle,
}: {
  control: Control<EventFormValues>;
  name: "allDay" | "hasEnd";
  label: string;
  description?: string;
  onToggle: () => void;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-lg border border-border px-3 py-2.5">
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                onToggle();
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

// Shown only when the device zone differs, which is when a typed time is most likely wrong.
function ZoneNotice() {
  const [zone, setZone] = useState<string | null>(null);
  useEffect(() => {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (local !== EVENT_TIME_ZONE && local !== "Asia/Calcutta") setZone(local);
  }, []);
  if (!zone) return null;
  return (
    <span className="text-foreground">
      Your device is set to {zone.replaceAll("_", " ")}, so convert times first.
    </span>
  );
}

const previewDay = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function EventPreview({ control }: { control: Control<EventFormValues> }) {
  const values = useWatch({ control }) as EventFormValues;
  const hasTime = values.allDay || !!values.startTime;
  const payload = values.startDate
    ? toEventPayload({
        ...values,
        startTime: values.startTime || "00:00",
        links: (values.links ?? []).filter((link) =>
          isHttpUrl(link?.url ?? "")
        ),
      })
    : null;
  const day = values.startDate ? parseDayKey(values.startDate) : null;

  return (
    <Panel className="flex flex-col gap-3">
      <div className="space-y-1">
        <h2 className="text-body-lg font-medium text-foreground">
          Calendar preview
        </h2>
        <p className="text-body text-muted-foreground">
          How this appears on the public academic calendar.
        </p>
      </div>
      {payload && day && !Number.isNaN(payload.time.getTime()) ? (
        <div className="flex flex-col gap-2" aria-live="polite">
          <h3 className="text-body font-medium text-foreground">
            {previewDay.format(
              new Date(Date.UTC(day.year, day.month, day.day))
            )}
          </h3>
          <EventCard
            headingLevel={4}
            event={{
              ...payload,
              title: payload.title || "Untitled event",
              endDate:
                payload.endDate && !Number.isNaN(payload.endDate.getTime())
                  ? payload.endDate
                  : null,
            }}
          />
          {!hasTime && (
            <p className="text-caption text-muted-foreground">
              Reads "All day" until you pick a start time.
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-body text-muted-foreground">
          Pick a start date to see the preview.
        </p>
      )}
    </Panel>
  );
}
