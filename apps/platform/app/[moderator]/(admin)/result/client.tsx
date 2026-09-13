"use client";

import { EmptyNote } from "@/components/application/dashboard/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  CheckCircle2,
  DownloadCloud,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type { AbNormalResult } from "~/lib/server-apis/types";
import { orgConfig } from "~/project.config";
import { ConfirmDialog } from "./_components/confirm-dialog";
import {
  CountTile,
  ErrorTable,
  InlineError,
  JobProgress,
} from "./_components/job-ui";
import {
  addResultFromSite,
  deleteResultsBulk,
  deleteStoredResult,
  findStoredResult,
  previewResultFromSite,
  type RankJobSummary,
  recalculateRanks,
  refreshResultsChunk,
  refreshStoredResult,
  type ResultSummary,
  sendResultUpdateMail,
  syncBranchChanges,
} from "./actions";
import { parseRecipients, resultMailSubject } from "./mail-copy";

function useElapsed(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    setSeconds(0);
    const started = Date.now();
    const id = setInterval(
      () => setSeconds(Math.round((Date.now() - started) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [running]);
  return seconds;
}

// --- Maintenance jobs ---

type JobState<T> =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; data: T }
  | { status: "error"; error: string };

export function RecalculateRanksJob({ total }: { total: number }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<JobState<RankJobSummary>>({
    status: "idle",
  });
  const elapsed = useElapsed(state.status === "running");

  const run = async () => {
    setState({ status: "running" });
    toast.info("Rank recalculation started");
    const res = await recalculateRanks();
    setState(
      res.ok
        ? { status: "done", data: res.data }
        : { status: "error", error: res.error }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {state.status === "running" ? (
        <JobProgress
          done={0}
          total={null}
          label={`Recalculating ranks, ${elapsed}s`}
        />
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setOpen(true)}
        >
          <RefreshCw aria-hidden="true" />
          {state.status === "done" ? "Run again" : "Recalculate ranks"}
        </Button>
      )}
      {state.status === "done" && (
        <dl className="grid grid-cols-3 gap-2">
          <CountTile label="Matched" value={state.data.matchedCount ?? "N/A"} />
          <CountTile
            label="Changed"
            value={state.data.modifiedCount ?? "N/A"}
            tone="success"
          />
          <CountTile
            label="Failed"
            value={state.data.failedCount}
            tone={state.data.failedCount > 0 ? "destructive" : "neutral"}
          />
          {state.data.timeTaken && (
            <p className="col-span-3 text-caption text-muted-foreground">
              {state.data.message}, took {state.data.timeTaken}.
            </p>
          )}
        </dl>
      )}
      {state.status === "error" && <InlineError>{state.error}</InlineError>}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Recalculate every rank?"
        description="Ranks are rebuilt from each student's latest CGPI."
        consequences={[
          `Rewrites college, batch, branch and class ranks on all ${total.toLocaleString("en-IN")} records.`,
          "Students may see their rank change on the public results pages right away.",
          "Runs on the server and can't be cancelled once started.",
        ]}
        confirmLabel="Recalculate ranks"
        onConfirm={run}
      />
    </div>
  );
}

export function SyncBranchesJob() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<JobState<{ timeTaken: string | null }>>(
    { status: "idle" }
  );
  const elapsed = useElapsed(state.status === "running");

  const run = async () => {
    setState({ status: "running" });
    toast.info("Branch sync started");
    const res = await syncBranchChanges();
    setState(
      res.ok
        ? { status: "done", data: res.data }
        : { status: "error", error: res.error }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {state.status === "running" ? (
        <JobProgress
          done={0}
          total={null}
          label={`Syncing branches, ${elapsed}s`}
        />
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setOpen(true)}
        >
          <RefreshCw aria-hidden="true" />
          {state.status === "done" ? "Run again" : "Sync branches"}
        </Button>
      )}
      {state.status === "done" && (
        <p className="flex items-center gap-2 text-body text-foreground">
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          Branches synced
          {state.data.timeTaken ? ` in ${state.data.timeTaken}` : ""}.
        </p>
      )}
      {state.status === "error" && <InlineError>{state.error}</InlineError>}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Sync branch changes?"
        description="Each record's branch is inferred from the course codes it has taken most."
        consequences={[
          "Overwrites the branch on any record whose courses point to a different department.",
          "Changes which branch list and branch rank a student appears in.",
          "Runs on the server and can't be cancelled once started.",
        ]}
        confirmLabel="Sync branches"
        onConfirm={run}
      />
    </div>
  );
}

// --- Single record lookup ---

type LookupState =
  | { status: "idle" }
  | { status: "loading"; message: string }
  | { status: "stored"; result: ResultSummary }
  | { status: "preview"; result: ResultSummary }
  | { status: "missing"; rollNo: string }
  | { status: "deleted"; rollNo: string }
  | { status: "error"; error: string };

export function ResultLookup() {
  const [rollNo, setRollNo] = useState("");
  const [state, setState] = useState<LookupState>({ status: "idle" });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const busy = isPending || state.status === "loading";

  const runStep = (
    message: string,
    step: () => Promise<LookupState>
  ) => {
    setState({ status: "loading", message });
    startTransition(async () => setState(await step()));
  };

  const lookUp = () => {
    const value = rollNo.trim();
    if (!value) return;
    runStep("Looking up the database", async () => {
      const res = await findStoredResult(value);
      if (!res.ok) return { status: "error", error: res.error };
      return res.data
        ? { status: "stored", result: res.data }
        : { status: "missing", rollNo: value.toLowerCase() };
    });
  };

  const current =
    state.status === "stored" || state.status === "preview"
      ? state.result.rollNo
      : state.status === "missing"
        ? state.rollNo
        : rollNo.trim();

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          lookUp();
        }}
      >
        <Label htmlFor="lookup-roll" className="sr-only">
          Roll number
        </Label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="lookup-roll"
            placeholder="Roll number, e.g. 21bcs001"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            className="h-10 pl-9 font-mono"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button type="submit" disabled={busy || !rollNo.trim()}>
          Look up
        </Button>
      </form>

      <div aria-live="polite" className="flex flex-col gap-3">
        {state.status === "loading" && (
          <JobProgress done={0} total={null} label={state.message} />
        )}
        {state.status === "error" && <InlineError>{state.error}</InlineError>}
        {state.status === "deleted" && (
          <p className="flex items-center gap-2 text-body text-foreground">
            <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            Deleted <span className="font-mono">{state.rollNo}</span>. Run
            &quot;Recalculate ranks&quot; to close the gap it leaves.
          </p>
        )}
        {state.status === "missing" && (
          <EmptyNote
            title={`${state.rollNo} isn't in the database`}
            description="Preview the college site's copy first, or fetch and save it straight away."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    runStep("Fetching from the college site", async () => {
                      const res = await previewResultFromSite(state.rollNo);
                      return res.ok
                        ? { status: "preview", result: res.data }
                        : { status: "error", error: res.error };
                    })
                  }
                >
                  Preview from site
                </Button>
                <Button
                  variant="primary"
                  disabled={busy}
                  onClick={() =>
                    runStep("Fetching and saving", async () => {
                      const res = await addResultFromSite(state.rollNo);
                      return res.ok
                        ? { status: "stored", result: res.data }
                        : { status: "error", error: res.error };
                    })
                  }
                >
                  <DownloadCloud aria-hidden="true" />
                  Fetch and save
                </Button>
              </div>
            }
          />
        )}
        {(state.status === "stored" || state.status === "preview") && (
          <ResultSummaryCard
            result={state.result}
            saved={state.status === "stored"}
            actions={
              state.status === "stored" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      runStep("Refreshing from the college site", async () => {
                        const res = await refreshStoredResult(current);
                        if (res.ok) toast.success("Result refreshed");
                        return res.ok
                          ? { status: "stored", result: res.data }
                          : { status: "error", error: res.error };
                      })
                    }
                  >
                    <RefreshCw aria-hidden="true" />
                    Refresh from site
                  </Button>
                  <Button
                    variant="destructive_soft"
                    size="sm"
                    disabled={busy}
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 aria-hidden="true" />
                    Delete
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    runStep("Saving", async () => {
                      const res = await addResultFromSite(current);
                      return res.ok
                        ? { status: "stored", result: res.data }
                        : { status: "error", error: res.error };
                    })
                  }
                >
                  <DownloadCloud aria-hidden="true" />
                  Save to database
                </Button>
              )
            }
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        tone="destructive"
        title={`Delete ${current}?`}
        description="The stored result is removed permanently."
        consequences={[
          "The public result page for this roll number stops working.",
          "Every other student's rank stays as it is until ranks are recalculated.",
          "You can bring the record back with Fetch and save, if the college site still has it.",
        ]}
        requireText={current}
        confirmLabel="Delete record"
        onConfirm={() =>
          runStep("Deleting", async () => {
            const res = await deleteStoredResult(current);
            return res.ok
              ? { status: "deleted", rollNo: current }
              : { status: "error", error: res.error };
          })
        }
      />
    </div>
  );
}

function ResultSummaryCard({
  result,
  saved,
  actions,
}: {
  result: ResultSummary;
  saved: boolean;
  actions: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-body-lg font-medium text-foreground">
            {result.name}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
            <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-foreground">
              {result.rollNo}
            </span>
            <span>{result.branch}</span>
            <span>
              {result.programme}, batch {result.batch}
            </span>
          </p>
        </div>
        <Badge variant={saved ? "success_soft" : "warning_soft"}>
          {saved ? "Saved" : "Preview, not saved"}
        </Badge>
      </div>
      <dl className="grid grid-cols-2 gap-2 @xl:grid-cols-4">
        <CountTile
          label="Latest CGPI"
          value={result.latestCgpi?.toFixed(2) ?? "N/A"}
        />
        <CountTile label="Semesters" value={result.semesters} />
        <CountTile
          label="College rank"
          value={result.collegeRank ? `#${result.collegeRank}` : "N/A"}
        />
        <CountTile
          label="Updated"
          value={
            result.updatedAt
              ? formatDistanceToNow(new Date(result.updatedAt), {
                  addSuffix: true,
                })
              : "N/A"
          }
        />
      </dl>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        {saved && (
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`/results/${result.rollNo}`}
              target="_blank"
              prefetch={false}
            >
              Public page
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}

// --- Flagged records ---

const REFRESH_CHUNK = 16;

type BulkState =
  | { status: "idle" }
  | { status: "running"; kind: "refresh"; done: number; total: number }
  | { status: "running"; kind: "delete" }
  | {
      status: "done";
      kind: "refresh";
      sent: number;
      cancelled: boolean;
      errors: { rollNo: string; error: string }[];
    }
  | { status: "done"; kind: "delete"; deleted: number }
  | { status: "error"; error: string };

export function FlaggedRecords({ records }: { records: AbNormalResult[] }) {
  const router = useRouter();
  const [state, setState] = useState<BulkState>({ status: "idle" });
  const [confirm, setConfirm] = useState<"refresh" | "delete" | null>(null);
  const cancelRef = useRef(false);
  const [, startRefresh] = useTransition();

  const rollNos = records.map((r) => r.rollNo);
  const running = state.status === "running";

  const refreshAll = async () => {
    cancelRef.current = false;
    const errors: { rollNo: string; error: string }[] = [];
    let sent = 0;
    setState({ status: "running", kind: "refresh", done: 0, total: rollNos.length });
    for (let i = 0; i < rollNos.length; i += REFRESH_CHUNK) {
      if (cancelRef.current) break;
      const chunk = rollNos.slice(i, i + REFRESH_CHUNK);
      const res = await refreshResultsChunk(chunk);
      if (res.ok) {
        errors.push(...res.data.errors);
      } else {
        errors.push(...chunk.map((rollNo) => ({ rollNo, error: res.error })));
      }
      sent += chunk.length;
      setState({ status: "running", kind: "refresh", done: sent, total: rollNos.length });
    }
    setState({
      status: "done",
      kind: "refresh",
      sent,
      cancelled: cancelRef.current,
      errors,
    });
    startRefresh(() => router.refresh());
  };

  const deleteAll = async () => {
    setState({ status: "running", kind: "delete" });
    const res = await deleteResultsBulk(rollNos);
    setState(
      res.ok
        ? { status: "done", kind: "delete", deleted: res.data.deletedCount }
        : { status: "error", error: res.error }
    );
    if (res.ok) startRefresh(() => router.refresh());
  };

  if (records.length === 0 && state.status !== "done") {
    return (
      <EmptyNote
        icon={<CheckCircle2 aria-hidden="true" />}
        title="Nothing flagged"
        description="Every record's semester count is close to the average for its programme and batch."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body text-foreground">
          <span className="font-medium tabular-nums">
            {records.length.toLocaleString("en-IN")}
          </span>{" "}
          {records.length === 1 ? "record" : "records"} flagged
        </p>
        <div className="flex flex-wrap gap-2">
          {running && state.kind === "refresh" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cancelRef.current = true;
                toast.info("Stopping after the current batch");
              }}
            >
              Cancel
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={running || records.length === 0}
                onClick={() => setConfirm("refresh")}
              >
                <RefreshCw aria-hidden="true" />
                Re-scrape all
              </Button>
              <Button
                variant="destructive_soft"
                size="sm"
                disabled={running || records.length === 0}
                onClick={() => setConfirm("delete")}
              >
                <Trash2 aria-hidden="true" />
                Delete all
              </Button>
            </>
          )}
        </div>
      </div>

      <div aria-live="polite" className="flex flex-col gap-3">
        {state.status === "running" && state.kind === "refresh" && (
          <JobProgress
            done={state.done}
            total={state.total}
            label="Re-scraping flagged records"
          />
        )}
        {state.status === "running" && state.kind === "delete" && (
          <JobProgress done={0} total={null} label="Deleting flagged records" />
        )}
        {state.status === "error" && <InlineError>{state.error}</InlineError>}
        {state.status === "done" && state.kind === "delete" && (
          <p className="flex items-center gap-2 text-body text-foreground">
            <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            Deleted {state.deleted.toLocaleString("en-IN")} records. Recalculate
            ranks to close the gaps.
          </p>
        )}
        {state.status === "done" && state.kind === "refresh" && (
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-body text-foreground">
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
              {state.cancelled ? "Stopped after" : "Sent"}{" "}
              {state.sent.toLocaleString("en-IN")} records to the scraper. The
              list below now shows what is still flagged.
            </p>
            {state.errors.length > 0 && <ErrorTable errors={state.errors} />}
          </div>
        )}
      </div>

      {records.length > 0 && (
        <ul className="max-h-96 divide-y divide-border overflow-y-auto rounded-xl border border-border">
          {records.map((record) => (
            <li key={record._id}>
              <Link
                href={`/results/${record.rollNo}`}
                target="_blank"
                prefetch={false}
                className="flex items-center justify-between gap-3 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <span className="min-w-0">
                  <span className="block truncate text-body font-medium text-foreground">
                    {record.name}
                  </span>
                  <span className="flex flex-wrap gap-x-3 text-caption text-muted-foreground">
                    <span className="font-mono">{record.rollNo}</span>
                    <span>
                      {record.programme}, batch {record.batch}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-right text-caption tabular-nums text-muted-foreground">
                  <span className="text-foreground">
                    {record.semesterCount} semesters
                  </span>
                  <br />
                  cohort avg {record.avgSemesterCount.toFixed(1)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirm === "refresh"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={`Re-scrape ${records.length} flagged records?`}
        description={`Each record is fetched again from the college site, ${REFRESH_CHUNK} at a time.`}
        consequences={[
          "Replaces the stored semesters of each record with the college site's copy.",
          "Sends one request per record to the college site; this can take several minutes.",
          "You can cancel between batches; records already sent stay updated.",
        ]}
        confirmLabel="Start re-scrape"
        onConfirm={refreshAll}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onOpenChange={(open) => !open && setConfirm(null)}
        tone="destructive"
        title={`Delete ${records.length} flagged records?`}
        description="Exactly the records listed here are removed permanently."
        consequences={[
          `Removes ${records.length} stored results and their public pages.`,
          "Ranks keep their gaps until you recalculate them.",
          "Records can only come back by scraping them again.",
        ]}
        requireText={`delete ${records.length}`}
        confirmLabel="Delete records"
        onConfirm={deleteAll}
      />
    </div>
  );
}

// --- Mail ---

export function ResultMailer() {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [outcome, setOutcome] = useState<
    | { ok: true; accepted: number; rejected: string[] }
    | { ok: false; error: string }
    | null
  >(null);
  const { valid, invalid } = parseRecipients(input);

  const send = () =>
    startTransition(async () => {
      const res = await sendResultUpdateMail(input);
      if (res.ok) {
        setOutcome({ ok: true, ...res.data });
        setInput("");
      } else {
        setOutcome({ ok: false, error: res.error });
      }
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="mail-targets" className="text-body text-foreground">
          Recipients
        </Label>
        <Textarea
          id="mail-targets"
          rows={3}
          placeholder={`21bcs001, 21bcs002${orgConfig.mailSuffix}`}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOutcome(null);
          }}
          aria-describedby="mail-targets-hint"
        />
        <p id="mail-targets-hint" className="text-caption text-muted-foreground">
          Separate with commas, spaces or new lines. A bare username gets{" "}
          {orgConfig.mailSuffix} added.
          {input.trim() && (
            <>
              {" "}
              <span className="text-foreground">
                {valid.length} valid
              </span>
              {invalid.length > 0 && (
                <span className="text-destructive">
                  , {invalid.length} invalid: {invalid.slice(0, 3).join(", ")}
                  {invalid.length > 3 ? "..." : ""}
                </span>
              )}
            </>
          )}
        </p>
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          disabled={isPending || valid.length === 0}
          onClick={() => setOpen(true)}
        >
          <Send aria-hidden="true" />
          {isPending ? "Sending" : `Send to ${valid.length || ""}`.trim()}
        </Button>
      </div>
      {outcome?.ok === false && <InlineError>{outcome.error}</InlineError>}
      {outcome?.ok && (
        <p
          aria-live="polite"
          className="flex items-center gap-2 text-body text-foreground"
        >
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          Accepted by the mail server for {outcome.accepted} recipients
          {outcome.rejected.length > 0
            ? `, rejected: ${outcome.rejected.join(", ")}`
            : ""}
          .
        </p>
      )}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Email ${valid.length} ${valid.length === 1 ? "student" : "students"}?`}
        description={`Subject: "${resultMailSubject()}"`}
        consequences={[
          "Sends the result update template to every address listed.",
          "Emails can't be recalled once sent.",
          ...(invalid.length > 0
            ? [`${invalid.length} invalid addresses will be skipped.`]
            : []),
        ]}
        confirmLabel="Send email"
        onConfirm={send}
      />
    </div>
  );
}
