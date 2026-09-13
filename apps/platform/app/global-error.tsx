"use client";

import "@fontsource-variable/google-sans";
import "@fontsource-variable/inter";
import { useEffect } from "react";
import { ErrorState } from "@/components/site/error-state";
import "./global.css";

// Replaces the root layout, so it skips Provider and the navbar: either may be what crashed.
export default function GlobalError({
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
    <html lang="en">
      <body className="min-h-screen w-full bg-canvas antialiased">
        <main
          id="main"
          className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-16"
        >
          <ErrorState variant="error" error={error} reset={reset} />
        </main>
      </body>
    </html>
  );
}
