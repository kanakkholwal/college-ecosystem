"use client";

import {
  CircleAlert,
  LoaderCircle,
  LogIn,
  LogOut,
  ScanBarcode,
  Search,
  X,
} from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { EmptyNote } from "@/components/application/dashboard/primitives";
import {
  OutpassStatusTag,
  REASON_LABEL,
  shortDateTime,
} from "@/components/application/hostel/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { allowEntryExit } from "~/actions/hostel.outpass";
import { apiFetch } from "~/lib/fetch-client";
import type { OutPassType } from "~/models/hostel_n_outpass";

type ResponseType =
  | { identifier: "rollNo"; history: OutPassType[] }
  | { identifier: "id"; outpass: OutPassType | null }
  | { identifier: "unknown"; message: string };

type GateAction =
  | { kind: "exit" | "entry" }
  | { kind: "blocked"; reason: string }
  | { kind: "done"; reason: string };

function gateAction(outpass: OutPassType): GateAction {
  switch (outpass.status) {
    case "pending":
      return {
        kind: "blocked",
        reason: "Not approved yet. Don't let them out.",
      };
    case "rejected":
      return {
        kind: "blocked",
        reason: "Rejected by the warden. Don't let them out.",
      };
    case "processed":
      return { kind: "done", reason: "Already back. This pass is used up." };
    case "in_use":
      return { kind: "entry" };
    case "approved":
      return new Date(outpass.expectedInTime).getTime() < Date.now()
        ? { kind: "blocked", reason: "Expired. The return time has passed." }
        : { kind: "exit" };
    default:
      return { kind: "blocked", reason: "This pass can't be used." };
  }
}

/** Gate console: USB scanners type into the focused field and press Enter, so no global key listener is needed. */
export default function OutpassVerifier() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [term, setTerm] = useQueryState("rollNo", parseAsString);
  const [history, setHistory] = useState<OutPassType[]>([]);
  const [current, setCurrent] = useState<OutPassType | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const search = useCallback(async (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<ResponseType>(
        `/api/outpass/status?identifier=${encodeURIComponent(value)}`
      );
      const data = response.data;
      if (response.error || !data) {
        setError(
          response.error?.message || "Couldn't look that up. Try again."
        );
        setCurrent(null);
        setHistory([]);
        return;
      }
      if (data.identifier === "rollNo") {
        setHistory(data.history);
        setCurrent(data.history[0] ?? null);
      } else if (data.identifier === "id") {
        setCurrent(data.outpass);
        setHistory(data.outpass ? [data.outpass] : []);
      } else {
        setError(data.message);
      }
      setSearched(true);
    } catch {
      setError("Network error. Check the connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = () => {
    setTerm(null);
    setCurrent(null);
    setHistory([]);
    setSearched(false);
    setError("");
    inputRef.current?.focus();
  };

  // Not optimistic: the server's atomic update decides, then we re-read the pass.
  const log = async (kind: "exit" | "entry") => {
    if (!current) return;
    setUpdating(true);
    try {
      const message = await allowEntryExit(current._id, kind);
      toast.success(message);
      await search(term || current._id);
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : "Couldn't log that. Try again."
      );
      await search(term || current._id);
    } finally {
      setUpdating(false);
    }
  };

  const action = current ? gateAction(current) : null;

  return (
    <div className="@container flex flex-col gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (term) search(term);
        }}
        className="flex h-16 items-center gap-2 rounded-2xl border border-border bg-card px-2 focus-within:border-ring dark:bg-background"
      >
        <ScanBarcode
          className="ml-2 size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor="gate-search" className="sr-only">
          Roll number or outpass barcode
        </label>
        <Input
          ref={inputRef}
          id="gate-search"
          autoFocus
          autoComplete="off"
          autoCapitalize="characters"
          inputMode="text"
          value={term ?? ""}
          onChange={(e) => setTerm(e.target.value || null)}
          placeholder="Roll number, or scan the pass"
          className="h-12 flex-1 border-none bg-transparent px-2 font-mono text-body-lg shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        {term && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            aria-label="Clear"
          >
            <X aria-hidden="true" />
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading || !term}
        >
          {loading ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Search aria-hidden="true" />
          )}
          <span className="hidden @sm:inline">Look up</span>
        </Button>
      </form>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 dark:bg-background"
        >
          <CircleAlert
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <p className="text-body-lg text-foreground">{error}</p>
        </div>
      )}

      {loading && !current && (
        <div className="flex flex-col gap-3" aria-busy="true">
          <span className="sr-only">Looking up</span>
          <Skeleton className="h-40 rounded-2xl bg-muted" />
          <Skeleton className="h-16 rounded-2xl bg-muted" />
        </div>
      )}

      {!loading && !error && !current && (
        <EmptyNote
          icon={<ScanBarcode />}
          title={searched ? "No outpass found" : "Ready to scan"}
          description={
            searched
              ? "This student has no outpasses. Check the roll number."
              : "Scan the barcode on the student's pass or type their roll number."
          }
        />
      )}

      {current && action && (
        <section
          aria-live="polite"
          aria-label="Outpass at the gate"
          className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 dark:bg-background"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-heading-sm font-medium text-foreground">
                {current.student?.name ?? "Unknown student"}
              </h2>
              <p className="font-mono text-body-lg text-muted-foreground">
                {current.student?.rollNumber}
              </p>
              <p className="text-body text-muted-foreground">
                {current.hostel?.name}, room {current.roomNumber}
              </p>
            </div>
            <OutpassStatusTag
              status={current.status}
              className="h-8 px-3 text-body"
            />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-body @xl:grid-cols-4">
            <Fact
              label="Reason"
              value={REASON_LABEL[current.reason] ?? current.reason}
            />
            <Fact label="Going to" value={current.address} />
            <Fact
              label={current.actualOutTime ? "Exited" : "Planned exit"}
              value={shortDateTime(
                current.actualOutTime ?? current.expectedOutTime
              )}
            />
            <Fact
              label={current.actualInTime ? "Returned" : "Back by"}
              value={shortDateTime(
                current.actualInTime ?? current.expectedInTime
              )}
            />
          </dl>

          {!("reason" in action) ? (
            <Button
              variant="primary"
              onClick={() => log(action.kind)}
              disabled={updating}
              className="h-16 w-full text-body-lg [&>svg]:size-6"
            >
              {updating ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : action.kind === "exit" ? (
                <LogOut aria-hidden="true" />
              ) : (
                <LogIn aria-hidden="true" />
              )}
              {action.kind === "exit" ? "Log exit" : "Log return"}
            </Button>
          ) : (
            <p
              role="status"
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-xl border px-4 text-body-lg font-medium",
                action.kind === "blocked"
                  ? "border-destructive text-destructive"
                  : "border-border text-foreground"
              )}
            >
              <CircleAlert className="size-6 shrink-0" aria-hidden="true" />
              {action.reason}
            </p>
          )}
        </section>
      )}

      {history.length > 1 && (
        <section aria-labelledby="gate-history" className="flex flex-col gap-3">
          <h2
            id="gate-history"
            className="text-subheading font-medium text-foreground"
          >
            Earlier passes
          </h2>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card dark:bg-background">
            {history.slice(1).map((pass) => (
              <li key={pass._id}>
                <button
                  type="button"
                  onClick={() => setCurrent(pass)}
                  className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <span className="text-body text-foreground">
                    {REASON_LABEL[pass.reason] ?? pass.reason}
                    <span className="text-muted-foreground">
                      , out {shortDateTime(pass.expectedOutTime)}
                    </span>
                  </span>
                  <OutpassStatusTag status={pass.status} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium text-foreground" title={value}>
        {value}
      </dd>
    </div>
  );
}
