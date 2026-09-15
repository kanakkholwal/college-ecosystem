"use client";

import { formatDistanceToNow } from "date-fns";
import { type ErrorEvent, EventSource } from "eventsource";
import {
  CheckCircle2,
  CircleSlash,
  Clock,
  History,
  Loader2,
  MoreHorizontal,
  Play,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  EmptyNote,
  Panel,
} from "@/components/application/dashboard/primitives";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ControlledResponsiveDialog } from "@/components/ui/responsive-dialog";
import { cn } from "@/lib/utils";
import { callAction } from "../_components/call-action";
import { ConfirmDialog } from "../_components/confirm-dialog";
import {
  CountTile,
  ErrorTable,
  InlineError,
  JobProgress,
  StepIndicator,
} from "../_components/job-ui";
import { clearScrapeTasks, deleteScrapeTask, listScrapeTasks } from "./actions";
import {
  EVENTS,
  LIST_LABELS,
  LIST_OPTIONS,
  LIST_TYPE,
  type ListType,
  TASK_STATUS,
  type TaskData,
} from "./types";

const SSE_PATH = "/api/admin/results/scrape-sse";
// The server emits task_status once per batch of 5 scrapes; keep-alive comments aren't visible to EventSource.
const SILENCE_LIMIT_MS = 90_000;
const MAX_RECONNECTS = 3;
const STEPS = ["Choose list", "Review", "Run", "Summary"];

type Phase = "choose" | "review" | "running" | "summary";
type RunMode = "start" | "resume" | "retry";
type Outcome =
  | { kind: "completed" }
  | { kind: "stopped" }
  | { kind: "lost"; message: string }
  | { kind: "failed"; message: string };

type Baseline = { processed: number; total: number | null };

function failuresOf(task: TaskData) {
  const reasons = new Map(
    (task.data ?? []).map((row) => [row.roll_no, row.reason])
  );
  const rolls = task.failedRollNos?.length
    ? task.failedRollNos
    : (task.data ?? []).map((row) => row.roll_no);
  return rolls.map((rollNo) => ({
    rollNo,
    error: reasons.get(rollNo) ?? "No reason recorded",
  }));
}

function listLabel(value: string) {
  return LIST_LABELS[value] ?? value.replaceAll("_", " ");
}

export function ScrapeConsole({
  initialTasks,
  historyError,
  estimates,
}: {
  initialTasks: TaskData[];
  historyError: string | null;
  estimates: Record<string, number | null>;
}) {
  const esRef = useRef<EventSource | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const taskRef = useRef<TaskData | null>(null);

  const [phase, setPhase] = useState<Phase>("choose");
  const [listType, setListType] = useState<ListType>(LIST_TYPE.BACKLOG);
  const [mode, setMode] = useState<RunMode>("start");
  const [task, setTask] = useState<TaskData | null>(null);
  const [baseline, setBaseline] = useState<Baseline>({
    processed: 0,
    total: null,
  });
  const [reconnecting, setReconnecting] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [history, setHistory] = useState(initialTasks);
  const [historyNote, setHistoryNote] = useState(historyError);
  const [confirm, setConfirm] = useState<
    | { kind: "resume" | "retry"; task: TaskData }
    | { kind: "delete"; task: TaskData }
    | { kind: "clear" }
    | null
  >(null);
  const [failuresFor, setFailuresFor] = useState<TaskData | null>(null);

  const running = phase === "running";

  const clearTimers = useCallback(() => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    watchdogRef.current = null;
    reconnectRef.current = null;
  }, []);

  const closeStream = useCallback(() => {
    clearTimers();
    esRef.current?.close();
    esRef.current = null;
  }, [clearTimers]);

  const reloadHistory = useCallback(async () => {
    const res = await callAction(listScrapeTasks);
    if (!res.ok) {
      setHistoryNote(`Couldn't refresh the history. ${res.error}`);
      return;
    }
    const tasks = res.data;
    setHistory(tasks);
    setHistoryNote(null);
    const mine = taskRef.current?._id
      ? tasks.find((t) => t._id === taskRef.current?._id)
      : undefined;
    if (mine) {
      taskRef.current = mine;
      setTask(mine);
    }
  }, []);

  const finish = useCallback(
    (next: Outcome) => {
      closeStream();
      setReconnecting(null);
      setOutcome(next);
      setPhase("summary");
      // The server writes the final status on disconnect, a moment after the stream closes.
      setTimeout(reloadHistory, 1500);
    },
    [closeStream, reloadHistory]
  );

  const openRef = useRef<
    (action: string, list: string, resumeId?: string) => void
  >(() => {});

  const onTransportLost = useCallback(
    (message: string, code?: number) => {
      closeStream();
      const id = taskRef.current?._id;
      if (id && code !== 429 && attemptsRef.current < MAX_RECONNECTS) {
        attemptsRef.current += 1;
        setReconnecting(attemptsRef.current);
        reconnectRef.current = setTimeout(
          () =>
            openRef.current(
              EVENTS.TASK_PAUSED_RESUME,
              taskRef.current?.list_type ?? LIST_TYPE.BACKLOG,
              id
            ),
          3000 * attemptsRef.current
        );
        return;
      }
      finish({ kind: "lost", message });
    },
    [closeStream, finish]
  );

  const armWatchdog = useCallback(() => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(
      () => onTransportLost("No progress from the server for 90 seconds."),
      SILENCE_LIMIT_MS
    );
  }, [onTransportLost]);

  const open = useCallback(
    (action: string, list: string, resumeId?: string) => {
      closeStream();
      const url = new URL(SSE_PATH, window.location.origin);
      url.searchParams.set("list_type", list);
      url.searchParams.set("action", action);
      if (resumeId) url.searchParams.set("task_resume_id", resumeId);

      // Same-origin proxy: the session cookie authorizes it, and the server identity stays server-side.
      const es = new EventSource(url.toString());
      esRef.current = es;
      armWatchdog();

      es.addEventListener("task_status", (event) => {
        if (esRef.current !== es) return;
        armWatchdog();
        attemptsRef.current = 0;
        setReconnecting(null);
        try {
          const payload = JSON.parse((event as MessageEvent).data)?.data;
          if (!payload) return;
          const merged = { ...(taskRef.current ?? {}), ...payload } as TaskData;
          taskRef.current = merged;
          setTask(merged);
          if (merged.status === TASK_STATUS.COMPLETED) {
            toast.success("Scraping finished");
            finish({ kind: "completed" });
          } else if (merged.status === TASK_STATUS.CANCELLED) {
            finish({ kind: "stopped" });
          }
        } catch {
          // A malformed frame is skipped; the next batch update carries full state.
        }
      });

      es.addEventListener("error", (event) => {
        if (esRef.current !== es) return;
        const data = (event as MessageEvent).data;
        if (typeof data === "string" && data) {
          let message = "The server stopped the task.";
          try {
            message = JSON.parse(data)?.error || message;
          } catch {}
          finish({ kind: "failed", message });
          return;
        }
        // Close before the library auto-reconnects: a replayed start URL would create a second task.
        const err = event as ErrorEvent;
        onTransportLost(
          err.code === 429
            ? "The server refused a new stream: another scrape is open in one of your tabs, or the scrape rate limit was hit. Close other tabs, wait a few minutes, then resume."
            : err.message || "Lost the connection to the server.",
          err.code
        );
      });
    },
    [armWatchdog, closeStream, finish, onTransportLost]
  );
  openRef.current = open;

  useEffect(() => closeStream, [closeStream]);

  useEffect(() => {
    if (!running) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  const begin = (runMode: RunMode, source: TaskData | null, list: string) => {
    attemptsRef.current = 0;
    taskRef.current = source;
    setTask(source);
    setMode(runMode);
    setOutcome(null);
    setBaseline(
      runMode === "retry" && source
        ? { processed: source.processed, total: source.failedRollNos.length }
        : { processed: 0, total: null }
    );
    setPhase("running");
    toast.info(
      runMode === "start" ? "Building the queue" : "Reconnecting to the task"
    );
    if (runMode === "start") open(EVENTS.STREAM_SCRAPING, list);
    else
      open(
        runMode === "resume"
          ? EVENTS.TASK_PAUSED_RESUME
          : EVENTS.TASK_RETRY_FAILED,
        list,
        source?._id
      );
  };

  const stop = () => {
    closeStream();
    toast.info("Stopping. Remaining roll numbers stay queued for resume.");
    finish({ kind: "stopped" });
  };

  const stepIndex = { choose: 0, review: 1, running: 2, summary: 3 }[phase];
  const selected = LIST_OPTIONS.find((o) => o.value === listType);
  const estimate = estimates[listType];
  const resumable = history.find(
    (t) =>
      t.list_type === listType &&
      t.status !== TASK_STATUS.COMPLETED &&
      (t.queue?.length ?? 0) > 0
  );

  return (
    <div className="flex flex-col gap-10">
      <Panel as="section" className="flex flex-col gap-6">
        <StepIndicator steps={STEPS} current={stepIndex} label="Scrape steps" />

        {phase === "choose" && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setPhase("review");
            }}
          >
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-body-lg font-medium text-foreground">
                Which students should be scraped?
              </legend>
              <div className="grid grid-cols-1 gap-2 @3xl:grid-cols-2">
                {LIST_OPTIONS.map((option) => {
                  const count = estimates[option.value];
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring",
                        listType === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border-strong"
                      )}
                    >
                      <input
                        type="radio"
                        name="list_type"
                        value={option.value}
                        checked={listType === option.value}
                        onChange={() => setListType(option.value)}
                        className="mt-1 size-4 accent-(--primary)"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-body font-medium text-foreground">
                            {option.label}
                          </span>
                          <span className="text-caption tabular-nums text-muted-foreground">
                            {typeof count === "number"
                              ? `${count.toLocaleString("en-IN")} records`
                              : "Count known after start"}
                          </span>
                        </span>
                        <span className="text-body text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                Review
              </Button>
            </div>
          </form>
        )}

        {phase === "review" && selected && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-body-lg font-medium text-foreground">
                {selected.label}
              </h2>
              <p className="text-body text-muted-foreground">
                {selected.description}
              </p>
            </div>
            <dl className="grid grid-cols-1 gap-2 @xl:grid-cols-3">
              <CountTile
                label="Roll numbers to scrape"
                value={
                  typeof estimate === "number" ? estimate : "Known after start"
                }
              />
              <CountTile label="Scraped in parallel" value={5} />
              <CountTile label="Writes to" value="Stored results" />
            </dl>
            <ul className="flex flex-col gap-2 rounded-xl border border-border p-4 text-body text-foreground">
              <li>
                Each record found on the college site has its semesters
                replaced; new roll numbers are created.
              </li>
              <li>
                Keep this page open. Closing it or pressing Stop pauses the
                task; you can resume it from the history below.
              </li>
              <li>Ranks are not recalculated automatically afterwards.</li>
            </ul>
            {estimate === 0 && (
              <InlineError>
                No records match this list right now, so the server will refuse
                to start.
              </InlineError>
            )}
            {resumable && (
              <p className="text-body text-muted-foreground">
                A stopped task for this list still has{" "}
                {resumable.queue.length.toLocaleString("en-IN")} roll numbers
                queued.{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() =>
                    begin("resume", resumable, resumable.list_type)
                  }
                >
                  Resume it instead
                </button>
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => setPhase("choose")}>
                Back
              </Button>
              <Button
                variant="primary"
                disabled={estimate === 0}
                onClick={() => begin("start", null, listType)}
              >
                <Play aria-hidden="true" />
                Start scraping
              </Button>
            </div>
          </div>
        )}

        {phase === "running" && (
          <RunView
            task={task}
            mode={mode}
            baseline={baseline}
            reconnecting={reconnecting}
            onStop={stop}
          />
        )}

        {phase === "summary" && outcome && (
          <SummaryView
            task={task}
            outcome={outcome}
            onResume={(t) => begin("resume", t, t.list_type)}
            onRetry={(t) => begin("retry", t, t.list_type)}
            onNew={() => {
              taskRef.current = null;
              setTask(null);
              setOutcome(null);
              setPhase("choose");
            }}
          />
        )}
      </Panel>

      <section
        aria-labelledby="history-heading"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2
              id="history-heading"
              className="text-subheading font-medium text-foreground"
            >
              History
            </h2>
            <p className="text-body text-muted-foreground">
              The 20 most recent tasks. Stopped tasks can be resumed.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={history.length === 0 || running}
            onClick={() => setConfirm({ kind: "clear" })}
          >
            <Trash2 aria-hidden="true" />
            Clear history
          </Button>
        </div>
        {historyNote && <InlineError>{historyNote}</InlineError>}
        {history.length === 0 ? (
          <EmptyNote
            icon={<History aria-hidden="true" />}
            title="No scrape tasks yet"
            description="Tasks you start above are logged here with their failures."
          />
        ) : (
          <HistoryTable
            tasks={history}
            disabled={running}
            onResume={(t) => setConfirm({ kind: "resume", task: t })}
            onRetry={(t) => setConfirm({ kind: "retry", task: t })}
            onDelete={(t) => setConfirm({ kind: "delete", task: t })}
            onShowFailures={setFailuresFor}
          />
        )}
      </section>

      <ControlledResponsiveDialog
        open={failuresFor !== null}
        onOpenChange={(o) => !o && setFailuresFor(null)}
        title="Failed roll numbers"
        description={
          failuresFor
            ? `${listLabel(failuresFor.list_type)}, started ${formatDistanceToNow(new Date(failuresFor.startTime), { addSuffix: true })}`
            : undefined
        }
        className="sm:max-w-2xl"
      >
        {failuresFor && <ErrorTable errors={failuresOf(failuresFor)} />}
      </ControlledResponsiveDialog>

      <ConfirmDialog
        open={confirm?.kind === "resume" || confirm?.kind === "retry"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={
          confirm?.kind === "retry"
            ? "Retry failed roll numbers?"
            : "Resume this task?"
        }
        description={
          confirm && "task" in confirm
            ? `${listLabel(confirm.task.list_type)}, started ${formatDistanceToNow(new Date(confirm.task.startTime), { addSuffix: true })}.`
            : ""
        }
        consequences={
          confirm && "task" in confirm
            ? confirm.kind === "retry"
              ? [
                  `Scrapes ${confirm.task.failedRollNos.length.toLocaleString("en-IN")} roll numbers that failed last time.`,
                  "Their previous failure reasons are cleared from the log.",
                ]
              : [
                  `Scrapes the ${(confirm.task.queue?.length ?? 0).toLocaleString("en-IN")} roll numbers still queued.`,
                  "Keep this page open until it finishes, or stop it again.",
                ]
            : []
        }
        confirmLabel={confirm?.kind === "retry" ? "Retry failed" : "Resume"}
        onConfirm={() => {
          if (confirm && "task" in confirm && confirm.kind !== "delete") {
            begin(confirm.kind, confirm.task, confirm.task.list_type);
          }
        }}
      />
      <ConfirmDialog
        open={confirm?.kind === "delete"}
        onOpenChange={(o) => !o && setConfirm(null)}
        tone="destructive"
        title="Delete this task log?"
        description="Only the log is removed; scraped results stay."
        consequences={[
          "Its failure reasons and remaining queue are lost.",
          "A stopped task can no longer be resumed.",
        ]}
        confirmLabel="Delete log"
        onConfirm={async () => {
          if (confirm?.kind !== "delete") return;
          const id = confirm.task._id;
          const res = await callAction(() => deleteScrapeTask(id));
          if (res.ok) {
            setHistory((prev) => prev.filter((t) => t._id !== id));
            toast.success("Task log deleted");
          } else toast.error(res.error);
        }}
      />
      <ConfirmDialog
        open={confirm?.kind === "clear"}
        onOpenChange={(o) => !o && setConfirm(null)}
        tone="destructive"
        title="Clear all scrape history?"
        description="Every task log is removed; scraped results stay."
        consequences={[
          `Deletes ${history.length} task logs and their failure reasons.`,
          "Stopped tasks can no longer be resumed.",
        ]}
        requireText="clear"
        confirmLabel="Clear history"
        onConfirm={async () => {
          const res = await callAction(clearScrapeTasks);
          if (res.ok) {
            setHistory([]);
            toast.success("History cleared");
          } else toast.error(res.error);
        }}
      />
    </div>
  );
}

function RunView({
  task,
  mode,
  baseline,
  reconnecting,
  onStop,
}: {
  task: TaskData | null;
  mode: RunMode;
  baseline: Baseline;
  reconnecting: number | null;
  onStop: () => void;
}) {
  const total = mode === "retry" ? baseline.total : task?.processable || null;
  const done = task
    ? Math.max(0, task.processed - (mode === "retry" ? baseline.processed : 0))
    : 0;
  const label = reconnecting
    ? `Reconnecting, attempt ${reconnecting} of ${MAX_RECONNECTS}`
    : !task
      ? "Building the queue"
      : mode === "retry"
        ? "Retrying failed roll numbers"
        : `Scraping ${listLabel(task.list_type)}`;

  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-body-lg font-medium text-foreground">{label}</h2>
          <p className="font-mono text-caption text-muted-foreground">
            {task?._id ? `Task ${task._id}` : "Waiting for the server"}
          </p>
        </div>
        <Button variant="outline" onClick={onStop}>
          Stop
        </Button>
      </div>
      <JobProgress done={done} total={total} label="Roll numbers processed" />
      <dl className="grid grid-cols-2 gap-2 @xl:grid-cols-4">
        <CountTile label="In queue" value={task?.queue?.length ?? 0} />
        <CountTile label="Processed" value={done} />
        <CountTile
          label="Succeeded"
          value={task?.success ?? 0}
          tone="success"
        />
        <CountTile
          label="Failed"
          value={task?.failed ?? 0}
          tone={(task?.failed ?? 0) > 0 ? "destructive" : "neutral"}
        />
      </dl>
      <p className="text-caption text-muted-foreground">
        Counts update after every 5 roll numbers. Failure reasons appear in the
        summary.
      </p>
    </div>
  );
}

function SummaryView({
  task,
  outcome,
  onResume,
  onRetry,
  onNew,
}: {
  task: TaskData | null;
  outcome: Outcome;
  onResume: (task: TaskData) => void;
  onRetry: (task: TaskData) => void;
  onNew: () => void;
}) {
  const failures = task ? failuresOf(task) : [];
  const queued = task?.queue?.length ?? 0;
  const title = {
    completed: "Scraping finished",
    stopped: "Task stopped",
    lost: "Connection lost",
    failed: "The server stopped the task",
  }[outcome.kind];
  const Glyph =
    outcome.kind === "completed"
      ? CheckCircle2
      : outcome.kind === "stopped"
        ? CircleSlash
        : XCircle;

  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      <div className="flex items-start gap-3">
        <Glyph
          className={cn(
            "mt-0.5 size-5 shrink-0",
            outcome.kind === "completed" && "text-success",
            outcome.kind === "stopped" && "text-muted-foreground",
            (outcome.kind === "lost" || outcome.kind === "failed") &&
              "text-destructive"
          )}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h2 className="text-body-lg font-medium text-foreground">{title}</h2>
          {"message" in outcome && (
            <p className="text-body text-muted-foreground">{outcome.message}</p>
          )}
          {outcome.kind === "stopped" && queued > 0 && (
            <p className="text-body text-muted-foreground">
              {queued.toLocaleString("en-IN")} roll numbers are still queued.
            </p>
          )}
        </div>
      </div>
      {task && (
        <dl className="grid grid-cols-2 gap-2 @xl:grid-cols-4">
          <CountTile label="Planned" value={task.processable} />
          <CountTile label="Processed" value={task.processed} />
          <CountTile label="Succeeded" value={task.success} tone="success" />
          <CountTile
            label="Failed"
            value={task.failed}
            tone={task.failed > 0 ? "destructive" : "neutral"}
          />
        </dl>
      )}
      {failures.length > 0 && <ErrorTable errors={failures} />}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onNew}>
          Start another task
        </Button>
        {task?._id && outcome.kind !== "completed" && queued > 0 && (
          <Button variant="primary" onClick={() => onResume(task)}>
            <Play aria-hidden="true" />
            Resume
          </Button>
        )}
        {task?._id && failures.length > 0 && (
          <Button
            variant={outcome.kind === "completed" ? "primary" : "outline"}
            onClick={() => onRetry(task)}
          >
            <RefreshCw aria-hidden="true" />
            Retry {failures.length} failed
          </Button>
        )}
      </div>
    </div>
  );
}

function StatusLabel({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; Icon: typeof Clock; tone: string }
  > = {
    [TASK_STATUS.COMPLETED]: {
      label: "Completed",
      Icon: CheckCircle2,
      tone: "text-success",
    },
    [TASK_STATUS.SCRAPING]: {
      label: "Running",
      Icon: Loader2,
      tone: "text-primary",
    },
    [TASK_STATUS.CANCELLED]: {
      label: "Stopped",
      Icon: CircleSlash,
      tone: "text-muted-foreground",
    },
    [TASK_STATUS.FAILED]: {
      label: "Failed",
      Icon: XCircle,
      tone: "text-destructive",
    },
  };
  const entry = map[status] ?? {
    label: status.replaceAll("_", " "),
    Icon: Clock,
    tone: "text-muted-foreground",
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-body text-foreground">
      <entry.Icon className={cn("size-4", entry.tone)} aria-hidden="true" />
      {entry.label}
    </span>
  );
}

function HistoryTable({
  tasks,
  disabled,
  onResume,
  onRetry,
  onDelete,
  onShowFailures,
}: {
  tasks: TaskData[];
  disabled: boolean;
  onResume: (task: TaskData) => void;
  onRetry: (task: TaskData) => void;
  onDelete: (task: TaskData) => void;
  onShowFailures: (task: TaskData) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card dark:bg-background">
      <table className="w-full min-w-2xl text-left text-body">
        <thead className="border-b border-border text-caption text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Started
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              List
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Processed
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Failed
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((task) => {
            const queued = task.queue?.length ?? 0;
            const canResume =
              task.status !== TASK_STATUS.COMPLETED && queued > 0;
            const canRetry = (task.failedRollNos?.length ?? 0) > 0;
            return (
              <tr key={task._id}>
                <td className="px-4 py-3 text-foreground">
                  {formatDistanceToNow(new Date(task.startTime), {
                    addSuffix: true,
                  })}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {listLabel(task.list_type)}
                </td>
                <td className="px-4 py-3">
                  <StatusLabel status={task.status} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">
                  {task.processed.toLocaleString("en-IN")}
                  <span className="text-muted-foreground">
                    {" "}
                    / {task.processable.toLocaleString("en-IN")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {task.failed > 0 ? (
                    <button
                      type="button"
                      className="font-medium text-destructive underline-offset-4 hover:underline"
                      onClick={() => onShowFailures(task)}
                    >
                      {task.failed.toLocaleString("en-IN")}
                      <span className="sr-only">
                        , show failed roll numbers
                      </span>
                    </button>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon_sm"
                        disabled={disabled}
                        aria-label="Task actions"
                      >
                        <MoreHorizontal aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canResume && (
                        <DropdownMenuItem onSelect={() => onResume(task)}>
                          <Play aria-hidden="true" />
                          Resume ({queued.toLocaleString("en-IN")} queued)
                        </DropdownMenuItem>
                      )}
                      {canRetry && (
                        <DropdownMenuItem onSelect={() => onRetry(task)}>
                          <RefreshCw aria-hidden="true" />
                          Retry failed
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => onDelete(task)}
                      >
                        <Trash2 aria-hidden="true" />
                        Delete log
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
