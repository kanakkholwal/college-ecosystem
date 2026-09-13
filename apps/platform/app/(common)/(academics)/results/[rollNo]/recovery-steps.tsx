"use client";

import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { appConfig } from "~/project.config";

/** Self-service fixes: `?new=1` fetches a missing result, `?update=1` re-fetches, `?cache=new` refreshes the list. */
export function RecoverySteps() {
  const pathname = usePathname();
  const steps = [
    {
      title: "My result isn't on the platform yet",
      body: "Fetch it from the college result site. This can take a few seconds.",
      href: `${pathname}?new=1`,
      label: "Fetch my result",
    },
    {
      title: "My result is outdated",
      body: "Pull the latest semester from the college result site.",
      href: `${pathname}?update=1`,
      label: "Update my result",
    },
    {
      title: "The search list looks stale",
      body: "Refresh the saved list of results.",
      href: "/results?cache=new",
      label: "Refresh results",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-3">
      <ol className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card dark:bg-background">
        {steps.map((step, i) => (
          <li key={step.href} className="flex items-start gap-4 p-4 sm:p-5">
            <span className="text-body font-semibold tabular-nums text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-body-lg font-medium text-foreground">
                  {step.title}
                </p>
                <p className="text-body text-muted-foreground">{step.body}</p>
              </div>
              <a
                href={step.href}
                className="inline-flex h-9 w-fit shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-body font-medium text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none"
              >
                {step.label}
              </a>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-body text-muted-foreground">
        Results held back by the college (for example for unfair means) can't be
        fetched.{" "}
        <a
          href={appConfig.contact}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-primary underline-offset-4 hover:underline"
        >
          Contact support
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      </p>
    </div>
  );
}
