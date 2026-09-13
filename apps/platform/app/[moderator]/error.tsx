"use client";

import { ErrorState } from "@/components/site/error-state";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-6 md:py-10">
      <ErrorState variant="error" error={error} reset={reset} />
    </div>
  );
}
