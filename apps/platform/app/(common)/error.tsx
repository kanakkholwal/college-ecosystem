"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/site/error-state";

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
    <div className="w-full px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:px-16">
      <ErrorState variant="error" error={error} reset={reset} />
    </div>
  );
}
