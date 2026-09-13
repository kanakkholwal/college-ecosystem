"use client";

import { TiltedChip } from "@/components/site/sections";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/utils/link";
import { RotateCw } from "lucide-react";
import { useEffect } from "react";

export default function TimetableError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Timetable page error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start px-4 py-16">
      <TiltedChip>Timetable error</TiltedChip>
      <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
        This timetable
        <br />
        <span className="text-primary">didn't load</span>
      </h1>
      <p className="mt-3 text-pretty text-body text-muted-foreground md:text-body-lg">
        The schedule service didn't respond. Try again, or pick your section
        from the list.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="primary" onClick={reset}>
          <RotateCw />
          Try again
        </Button>
        <ButtonLink href="/schedules" variant="outline">
          All timetables
        </ButtonLink>
      </div>
      {error.digest && (
        <p className="mt-6 font-mono text-caption text-muted-foreground">
          Reference {error.digest}
        </p>
      )}
    </div>
  );
}
