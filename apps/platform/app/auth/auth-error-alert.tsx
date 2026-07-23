"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import type { AuthErrorInfo } from "~/auth/errors";

export function AuthErrorAlert({ error }: { error: AuthErrorInfo | null }) {
  if (!error) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="space-y-1">
        <p className="font-medium text-destructive">{error.title}</p>
        {error.description && (
          <p className="text-muted-foreground">{error.description}</p>
        )}
        {error.action && (
          <Link
            href={error.action.href}
            className="inline-block font-medium text-primary hover:underline"
          >
            {error.action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
