"use client";

import { cn } from "@/lib/utils";
import { Check, CircleAlert, Loader2 } from "lucide-react";

export function StepIndicator({
  steps,
  current,
  label = "Progress",
}: {
  steps: string[];
  current: number;
  label?: string;
}) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={step}
              className="flex items-center gap-2"
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border text-caption font-medium tabular-nums",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary",
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                {done ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "text-body",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step}
                {done && <span className="sr-only"> (done)</span>}
              </span>
              {index < steps.length - 1 && (
                <span
                  className="mx-1 hidden h-px w-6 bg-border sm:block"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Determinate when `total` is known, otherwise an honest indeterminate stripe. */
export function JobProgress({
  done,
  total,
  label,
}: {
  done: number;
  total: number | null;
  label: string;
}) {
  const percent =
    total && total > 0 ? Math.min(100, Math.round((done / total) * 100)) : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 text-body">
        <span className="flex items-center gap-2 text-foreground">
          <Loader2
            className="size-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
          {label}
        </span>
        <span className="tabular-nums text-muted-foreground">
          {percent === null
            ? "Working"
            : `${done.toLocaleString("en-IN")} of ${total?.toLocaleString("en-IN")} (${percent}%)`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total ?? undefined}
        aria-valuenow={percent === null ? undefined : done}
        className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        {percent === null ? (
          <div className="absolute inset-y-0 w-1/3 animate-[job-indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-primary motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-40" />
        ) : (
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
      <style>{`@keyframes job-indeterminate{0%{left:-33%}100%{left:100%}}`}</style>
    </div>
  );
}

export function CountTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  tone?: "neutral" | "success" | "destructive" | "warning";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border p-3">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "font-heading text-subheading font-medium tabular-nums",
          tone === "neutral" && "text-foreground",
          tone === "success" && "text-success",
          tone === "destructive" && "text-destructive",
          tone === "warning" && "text-warning"
        )}
      >
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </dd>
    </div>
  );
}

export function InlineError({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-border p-3 text-body text-foreground"
    >
      <CircleAlert
        className="mt-0.5 size-4 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <span>{children}</span>
    </p>
  );
}

export function ErrorTable({
  errors,
}: {
  errors: { rollNo: string; error: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <p className="border-b border-border px-4 py-2 text-body font-medium text-foreground">
        {errors.length.toLocaleString("en-IN")}{" "}
        {errors.length === 1 ? "row" : "rows"} failed
      </p>
      <div className="max-h-72 overflow-auto">
        <table className="w-full text-left text-body">
          <thead className="sticky top-0 bg-card text-caption text-muted-foreground dark:bg-background">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">
                Roll number
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Reason
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {errors.map((row, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a roll number can fail more than once
              <tr key={`${row.rollNo}-${index}`}>
                <td className="px-4 py-2 font-mono text-foreground">
                  {row.rollNo}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{row.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
