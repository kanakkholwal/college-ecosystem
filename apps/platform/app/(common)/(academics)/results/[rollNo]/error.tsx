"use client";

import { TiltedChip } from "@/components/site/sections";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/utils/link";
import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { RecoverySteps } from "./recovery-steps";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Result page error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-16">
      <div className="flex flex-col items-start">
        <TiltedChip>Result error</TiltedChip>
        <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
          This result
          <br />
          <span className="text-primary">didn't load</span>
        </h1>
        <p className="mt-3 text-pretty text-body text-muted-foreground md:text-body-lg">
          Try again first. If it keeps failing, one of the fixes below usually
          helps.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="primary" onClick={reset}>
            <RotateCw />
            Try again
          </Button>
          <ButtonLink href="/results" variant="outline">
            Back to results
          </ButtonLink>
        </div>
        {(error.digest || error.message) && (
          <details className="mt-6 w-full rounded-xl border border-border bg-card px-4 py-3 text-body dark:bg-background">
            <summary className="cursor-pointer font-medium text-foreground">
              Error details
            </summary>
            <p className="mt-2 wrap-break-word font-mono text-caption text-muted-foreground">
              {error.message}
              {error.digest ? ` (digest ${error.digest})` : ""}
            </p>
          </details>
        )}
      </div>
      <RecoverySteps />
    </div>
  );
}
