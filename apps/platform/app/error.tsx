"use client";
import ErrorBanner from "@/components/utils/error";
import { useEffect } from "react";
// import posthog from "posthog-js";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // posthog.captureException(error);

    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
  return (
    <div className="flex items-center justify-center w-full h-full py-20">
      <ErrorBanner error={error} />
    </div>
  );
}
