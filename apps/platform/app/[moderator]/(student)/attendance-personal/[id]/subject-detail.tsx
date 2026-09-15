"use client";

import {
  EmptyNote,
  Panel,
  PanelTitle,
} from "@/components/application/dashboard/primitives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Check,
  CircleCheck,
  CircleX,
  Trash2,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useOptimistic, useState } from "react";
import toast from "@/lib/toast";
import {
  type AttendanceLog,
  deleteAttendanceLog,
  deleteAttendanceRecord,
  updateAttendanceRecord,
} from "~/actions/student.record_personal";
import { formatRate, getStanding } from "../standing";
import { StandingBadge, ThresholdBar } from "../standing-ui";
import { undoToast } from "../undo-toast";
import type { TrendPoint } from "./trend-chart";

const TrendChart = dynamic(() => import("./trend-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full rounded-xl bg-muted" />,
});

type Change =
  | { type: "add"; log: AttendanceLog }
  | { type: "remove"; id: string };

const applyChange = (logs: AttendanceLog[], change: Change) =>
  change.type === "add"
    ? [change.log, ...logs]
    : logs.filter((l) => l.id !== change.id);

const ist = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { ...options, timeZone: "Asia/Kolkata" });
const monthFormat = ist({ month: "long", year: "numeric" });
const dayFormat = ist({ weekday: "short", day: "numeric", month: "short" });
const timeFormat = ist({ hour: "numeric", minute: "2-digit" });
const shortFormat = ist({ day: "numeric", month: "short" });

type Subject = {
  id: string;
  subjectCode: string;
  subjectName: string;
  logs: AttendanceLog[];
};

export function SubjectDetail({
  subject,
  basePath,
}: {
  subject: Subject;
  basePath: string;
}) {
  const router = useRouter();
  const [logs, applyOptimistic] = useOptimistic(subject.logs, applyChange);
  const [busy, setBusy] = useState(false);
  const [confirmLog, setConfirmLog] = useState<AttendanceLog | null>(null);
  const [confirmSubject, setConfirmSubject] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const run = (change: Change, request: () => Promise<unknown>) => {
    setBusy(true);
    startTransition(async () => {
      applyOptimistic(change);
      try {
        await request();
      } catch {
        toast.error("You're offline or the server didn't answer. Try again.");
      } finally {
        setBusy(false);
      }
    });
  };

  const mark = (isPresent: boolean) => {
    const word = isPresent ? "present" : "absent";
    const temp: AttendanceLog = {
      id: `pending-${Date.now()}`,
      date: new Date().toISOString(),
      isPresent,
    };
    run({ type: "add", log: temp }, async () => {
      const res = await updateAttendanceRecord(subject.id, isPresent);
      if (!res.ok) return toast.error(res.error);
      setAnnouncement(`Marked ${word}.`);
      undoToast(`Marked ${word}.`, () => removeLog(res.data));
    });
  };

  const removeLog = (log: AttendanceLog) =>
    run({ type: "remove", id: log.id }, async () => {
      const res = await deleteAttendanceLog(log.id);
      if (!res.ok) return toast.error(res.error);
      setAnnouncement("Class removed.");
    });

  const deleteSubject = () => {
    setBusy(true);
    startTransition(async () => {
      const res = await deleteAttendanceRecord(subject.id).catch(() => null);
      setBusy(false);
      if (!res?.ok) {
        toast.error(res?.error ?? "Couldn't delete the subject. Try again.");
        return;
      }
      toast.success(`${subject.subjectName} deleted.`);
      router.push(basePath);
    });
  };

  const present = logs.filter((l) => l.isPresent).length;
  const standing = getStanding(present, logs.length);

  const trend = useMemo<TrendPoint[]>(() => {
    let attended = 0;
    return [...logs].reverse().map((log, i) => {
      if (log.isPresent) attended++;
      return {
        label: shortFormat.format(new Date(log.date)),
        rate: Math.round((attended / (i + 1)) * 1000) / 10,
      };
    });
  }, [logs]);

  const months = useMemo(() => {
    const groups = new Map<string, AttendanceLog[]>();
    for (const log of logs) {
      const key = monthFormat.format(new Date(log.date));
      groups.set(key, [...(groups.get(key) ?? []), log]);
    }
    return [...groups.entries()];
  }, [logs]);

  return (
    <div className="flex flex-col gap-3">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-5">
        <Panel as="section" className="flex flex-col gap-4 @3xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-body-lg font-medium text-foreground">
              Where you stand
            </h2>
            <StandingBadge standing={standing} />
          </div>
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
              {present} present, {logs.length - present} absent
            </p>
          </div>
          <ThresholdBar standing={standing} />
          <p className="text-body text-foreground">{standing.advice}</p>
          <div className="mt-auto grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="lg"
              disabled={busy}
              onClick={() => mark(true)}
            >
              <Check aria-hidden="true" />
              Present
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled={busy}
              onClick={() => mark(false)}
            >
              <X aria-hidden="true" />
              Absent
            </Button>
          </div>
        </Panel>

        <Panel as="section" className="@3xl:col-span-3">
          <PanelTitle>Attendance over time</PanelTitle>
          {trend.length < 2 ? (
            <EmptyNote
              icon={<CalendarDays />}
              title="Not enough classes yet"
              description="The trend appears after you mark two classes."
            />
          ) : (
            <>
              <TrendChart points={trend} />
              <p className="mt-2 text-caption text-muted-foreground">
                Your running percentage after each class. The dashed line is the
                minimum.
              </p>
            </>
          )}
        </Panel>
      </div>

      <Panel as="section">
        <PanelTitle
          meta={
            <span className="text-caption text-muted-foreground tabular-nums">
              {logs.length} {logs.length === 1 ? "class" : "classes"}
            </span>
          }
        >
          History
        </PanelTitle>
        {logs.length === 0 ? (
          <EmptyNote
            icon={<CalendarDays />}
            title="No classes marked"
            description="Tap Present or Absent after a class and it shows up here, newest first."
          />
        ) : (
          <div className="flex flex-col gap-6">
            {months.map(([month, entries]) => (
              <section key={month} aria-label={month}>
                <h3 className="mb-2 text-caption font-medium text-muted-foreground">
                  {month}
                </h3>
                <ul className="flex flex-col divide-y divide-border">
                  {entries.map((log) => {
                    const date = new Date(log.date);
                    const pending = log.id.startsWith("pending-");
                    return (
                      <li
                        key={log.id}
                        className="flex items-center gap-3 py-1.5"
                      >
                        {log.isPresent ? (
                          <CircleCheck
                            className="size-5 shrink-0 text-success"
                            aria-hidden="true"
                          />
                        ) : (
                          <CircleX
                            className="size-5 shrink-0 text-destructive"
                            aria-hidden="true"
                          />
                        )}
                        <span className="w-16 shrink-0 text-body font-medium text-foreground">
                          {log.isPresent ? "Present" : "Absent"}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-body tabular-nums text-muted-foreground">
                          {dayFormat.format(date)}, {timeFormat.format(date)}
                          {pending && " (saving)"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-11 text-muted-foreground hover:text-destructive"
                          disabled={busy || pending}
                          onClick={() => setConfirmLog(log)}
                          aria-label={`Remove ${log.isPresent ? "present" : "absent"} class on ${dayFormat.format(date)}`}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Panel>

      <Panel
        as="section"
        className="flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between"
      >
        <div className="space-y-1">
          <h2 className="text-body-lg font-medium text-foreground">
            Delete subject
          </h2>
          <p className="text-body text-muted-foreground">
            Removes {subject.subjectName} and all {logs.length} marked{" "}
            {logs.length === 1 ? "class" : "classes"}. This can't be undone.
          </p>
        </div>
        <Button
          variant="destructive_soft"
          disabled={busy}
          onClick={() => setConfirmSubject(true)}
        >
          <Trash2 aria-hidden="true" />
          Delete subject
        </Button>
      </Panel>

      <AlertDialog
        open={confirmLog !== null}
        onOpenChange={(open) => !open && setConfirmLog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this class?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmLog &&
                `${confirmLog.isPresent ? "Present" : "Absent"} on ${dayFormat.format(new Date(confirmLog.date))} will no longer count.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={() => confirmLog && removeLog(confirmLog)}
            >
              Remove class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmSubject} onOpenChange={setConfirmSubject}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {subject.subjectName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Its {logs.length} marked{" "}
              {logs.length === 1 ? "class is" : "classes are"} deleted too. This
              can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep subject</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={deleteSubject}
            >
              Delete subject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
