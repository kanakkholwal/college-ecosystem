"use client";

import { EventCard } from "@/components/application/event/card";
import { dayKey, parseDayKey } from "@/components/application/event/format";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Save, Sparkles, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { saveNewEvents } from "~/actions/common.events";
import {
  rawEventsSchema,
  type rawEventsSchemaType,
} from "~/constants/common.events";

const dayLabel = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export function ImportEvents() {
  const router = useRouter();
  const inputId = useId();
  const [file, setFile] = useState<{ name: string; data: string } | null>(null);
  const [events, setEvents] = useState<rawEventsSchemaType[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [reading, startReading] = useTransition();
  const [saving, startSaving] = useTransition();

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    setEvents(null);
    setError(null);
    setFile(
      picked ? { name: picked.name, data: await readAsDataUrl(picked) } : null
    );
  };

  const extract = () =>
    startReading(async () => {
      if (!file) return;
      setError(null);
      try {
        const response = await fetch("/api/parsing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: [file.data], type: "events" }),
        });
        const body = await response.json();
        if (!response.ok || body.error) {
          throw new Error(body.error || "The document couldn't be read");
        }
        const parsed = rawEventsSchema.array().safeParse(
          (body.events ?? []).map((item: rawEventsSchemaType) => ({
            ...item,
            time: new Date(item.time),
            endDate: item.endDate ? new Date(item.endDate) : undefined,
            description: item.description ?? "",
            links: [],
          }))
        );
        if (!parsed.success) {
          throw new Error(
            `Some dates in the document didn't make sense: ${parsed.error.issues[0].message}`
          );
        }
        setEvents(parsed.data);
        setSelected(new Set(parsed.data.map((_, index) => index)));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "The document couldn't be read"
        );
      }
    });

  const save = () =>
    startSaving(async () => {
      if (!events) return;
      const chosen = events.filter((_, index) => selected.has(index));
      try {
        await saveNewEvents(chosen);
        toast.success(
          chosen.length === 1
            ? "1 event added"
            : `${chosen.length} events added`
        );
        router.push("/admin/events");
      } catch (err) {
        setError(
          typeof err === "string" && err
            ? err
            : "The events couldn't be saved. Try again."
        );
      }
    });

  const toggle = (index: number, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(index);
      else next.delete(index);
      return next;
    });

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-labelledby={`${inputId}-heading`}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background"
      >
        <div className="space-y-1">
          <h2
            id={`${inputId}-heading`}
            className="text-body-lg font-medium text-foreground"
          >
            Read events from a document
          </h2>
          <p className="text-body text-muted-foreground">
            Upload a photo or PDF of the official academic calendar. Nothing is
            saved until you review the list and confirm.
          </p>
        </div>
        <div className="flex flex-col gap-3 @xl:flex-row @xl:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Label htmlFor={inputId}>Document (image or PDF)</Label>
            <Input
              id={inputId}
              type="file"
              accept="image/*,application/pdf"
              onChange={onFile}
              disabled={reading || saving}
            />
          </div>
          <Button onClick={extract} disabled={!file || reading || saving}>
            {reading ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles aria-hidden="true" />
            )}
            {reading ? "Reading document" : "Find events"}
          </Button>
        </div>
        {file && !events && !reading && (
          <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <FileText className="size-3.5" aria-hidden="true" />
            {file.name} is ready.
          </p>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-card p-4 dark:bg-background"
        >
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <p className="text-body text-foreground">{error}</p>
        </div>
      )}

      {events && (
        <section
          aria-labelledby={`${inputId}-review`}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2
                id={`${inputId}-review`}
                className="text-body-lg font-medium text-foreground"
              >
                Review {events.length} found{" "}
                {events.length === 1 ? "event" : "events"}
              </h2>
              <p className="text-body text-muted-foreground" aria-live="polite">
                {selected.size} selected. Untick anything that was read wrongly.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelected(
                  selected.size === events.length
                    ? new Set()
                    : new Set(events.map((_, index) => index))
                )
              }
            >
              {selected.size === events.length ? "Select none" : "Select all"}
            </Button>
          </div>

          {events.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-body text-muted-foreground">
              No events were found in this document. Try a clearer image.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
              {events.map((event, index) => {
                const { year, month, day } = parseDayKey(dayKey(event.time));
                const checkboxId = `${inputId}-event-${index}`;
                return (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: extracted rows have no id and never reorder
                    key={index}
                    className="flex flex-col gap-3 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={checkboxId}
                        className="mt-1"
                        checked={selected.has(index)}
                        onCheckedChange={(checked) =>
                          toggle(index, checked === true)
                        }
                        disabled={saving}
                      />
                      <Label
                        htmlFor={checkboxId}
                        className="flex min-w-0 flex-col gap-0.5"
                      >
                        <span className="text-body font-medium text-foreground">
                          {event.title}
                        </span>
                        <span className="text-caption font-normal text-muted-foreground">
                          {dayLabel.format(
                            new Date(Date.UTC(year, month, day))
                          )}
                        </span>
                      </Label>
                    </div>
                    <details className="group ml-7">
                      <summary className="inline-flex cursor-pointer list-none rounded-sm text-caption font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                        <span className="group-open:hidden">Preview card</span>
                        <span className="hidden group-open:inline">
                          Hide preview
                        </span>
                      </summary>
                      <EventCard event={event} className="mt-2" />
                    </details>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex justify-end border-t border-border pt-4">
            <Button
              variant="primary"
              onClick={save}
              disabled={selected.size === 0 || saving}
            >
              {saving ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Save aria-hidden="true" />
              )}
              {saving
                ? "Saving"
                : `Add ${selected.size} ${selected.size === 1 ? "event" : "events"}`}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
