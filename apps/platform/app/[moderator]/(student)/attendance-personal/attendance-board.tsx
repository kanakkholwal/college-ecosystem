"use client";

import { EmptyNote } from "@/components/application/dashboard/primitives";
import { KpiCard, KpiGrid } from "@/components/application/stats-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, ClipboardCheck, X } from "lucide-react";
import Link from "next/link";
import { startTransition, useOptimistic, useState } from "react";
import toast from "react-hot-toast";
import {
  type AttendanceSubject,
  deleteAttendanceLog,
  updateAttendanceRecord,
} from "~/actions/student.record_personal";
import { AddSubjectButton } from "./add-subject";
import { ATTENDANCE_THRESHOLD, formatRate, getStanding } from "./standing";
import { StandingBadge, ThresholdBar } from "./standing-ui";
import { undoToast } from "./undo-toast";

type Change = { id: string; isPresent: boolean; delta: 1 | -1 };

const applyChange = (subjects: AttendanceSubject[], change: Change) =>
  subjects.map((s) =>
    s.id === change.id
      ? {
          ...s,
          total: s.total + change.delta,
          present: s.present + (change.isPresent ? change.delta : 0),
        }
      : s
  );

export function AttendanceBoard({
  subjects,
  basePath,
}: {
  subjects: AttendanceSubject[];
  basePath: string;
}) {
  const [optimistic, applyOptimistic] = useOptimistic(subjects, applyChange);
  const [busy, setBusy] = useState<ReadonlySet<string>>(new Set());
  const [announcement, setAnnouncement] = useState("");

  const setSubjectBusy = (id: string, on: boolean) =>
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  // Server state replaces the optimistic value when the action settles; a failure rolls back.
  const run = (change: Change, request: () => Promise<boolean>) => {
    setSubjectBusy(change.id, true);
    startTransition(async () => {
      applyOptimistic(change);
      try {
        await request();
      } catch {
        toast.error("You're offline or the server didn't answer. Try again.");
      } finally {
        setSubjectBusy(change.id, false);
      }
    });
  };

  const mark = (subject: AttendanceSubject, isPresent: boolean) => {
    const word = isPresent ? "present" : "absent";
    run({ id: subject.id, isPresent, delta: 1 }, async () => {
      const res = await updateAttendanceRecord(subject.id, isPresent);
      if (!res.ok) {
        toast.error(res.error);
        return false;
      }
      setAnnouncement(`Marked ${word} in ${subject.subjectName}.`);
      undoToast(`Marked ${word} in ${subject.subjectName}.`, () =>
        run({ id: subject.id, isPresent, delta: -1 }, async () => {
          const undo = await deleteAttendanceLog(res.data.id);
          if (!undo.ok) toast.error(undo.error);
          else setAnnouncement(`Removed that class from ${subject.subjectName}.`);
          return undo.ok;
        })
      );
      return true;
    });
  };

  if (optimistic.length === 0) {
    return (
      <EmptyNote
        icon={<ClipboardCheck />}
        title="No subjects yet"
        description={`Add each subject from your timetable, then tap Present or Absent after every class. We'll tell you how many you can miss and still stay at ${ATTENDANCE_THRESHOLD}%.`}
        action={<AddSubjectButton size="default" />}
      />
    );
  }

  const present = optimistic.reduce((acc, s) => acc + s.present, 0);
  const total = optimistic.reduce((acc, s) => acc + s.total, 0);
  const overall = getStanding(present, total);
  const standings = optimistic.map((s) => ({
    subject: s,
    standing: getStanding(s.present, s.total),
  }));
  const below = standings.filter((s) => s.standing.level === "below");
  const edge = standings.filter((s) => s.standing.level === "edge");

  return (
    <div className="flex flex-col gap-10">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <KpiGrid className="@4xl:grid-cols-3" label="Attendance summary">
        <KpiCard
          label="Overall attendance"
          value={overall.rate === null ? null : formatRate(overall.rate)}
          hint={
            total === 0
              ? "Mark a class to start"
              : `${present} of ${total} classes across ${optimistic.length} ${optimistic.length === 1 ? "subject" : "subjects"}`
          }
        />
        <KpiCard
          label={`Below ${ATTENDANCE_THRESHOLD}%`}
          value={below.length}
          hint={
            below.length === 0
              ? "No subject below the minimum"
              : below.map((s) => s.subject.subjectName).join(", ")
          }
        />
        <KpiCard
          label="At risk"
          value={edge.length}
          hint={
            edge.length === 0
              ? "None on the edge"
              : "Missing the next class drops these below the minimum"
          }
        />
      </KpiGrid>

      <section aria-labelledby="subjects-heading" className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2
            id="subjects-heading"
            className="text-subheading font-medium text-foreground"
          >
            Subjects
          </h2>
          <p className="text-body text-muted-foreground">
            Tap Present or Absent after each class. A wrong tap can be undone
            from the message that follows.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @5xl:grid-cols-3">
          {standings.map(({ subject, standing }) => (
            <li key={subject.id}>
              <article className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-body-lg font-medium text-foreground">
                      {subject.subjectName}
                    </h3>
                    <p className="font-mono text-caption text-muted-foreground">
                      {subject.subjectCode}
                    </p>
                  </div>
                  <StandingBadge standing={standing} />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className={cn(
                        "font-heading font-medium tabular-nums text-foreground",
                        standing.rate === null ? "text-body-lg" : "text-heading"
                      )}
                    >
                      {formatRate(standing.rate)}
                    </p>
                    <p className="text-body tabular-nums text-muted-foreground">
                      {subject.present} of {subject.total} attended
                    </p>
                  </div>
                  <ThresholdBar standing={standing} />
                  <p className="text-body text-muted-foreground">
                    {standing.advice}
                  </p>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={busy.has(subject.id)}
                    onClick={() => mark(subject, true)}
                    aria-label={`Mark present in ${subject.subjectName}`}
                  >
                    <Check aria-hidden="true" />
                    Present
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={busy.has(subject.id)}
                    onClick={() => mark(subject, false)}
                    aria-label={`Mark absent in ${subject.subjectName}`}
                  >
                    <X aria-hidden="true" />
                    Absent
                  </Button>
                </div>
                <Link
                  href={`${basePath}/${subject.id}`}
                  className="group -mb-2 inline-flex h-11 items-center justify-center gap-1.5 rounded-md text-body font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  History and settings
                  <ArrowRight
                    className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                  <span className="sr-only"> for {subject.subjectName}</span>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
