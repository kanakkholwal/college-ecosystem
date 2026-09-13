"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AuthErrorInfo } from "~/auth/errors";

export function AuthErrorAlert({
  error,
  className,
}: {
  error: AuthErrorInfo | null;
  className?: string;
}) {
  if (!error) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-body",
        className
      )}
    >
      <AlertCircle
        className="mt-0.5 size-4 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <div className="space-y-1">
        <p className="font-medium text-destructive">{error.title}</p>
        {error.description && (
          <p className="text-muted-foreground">{error.description}</p>
        )}
        {error.action && (
          <Link
            href={error.action.href}
            className="inline-block font-medium text-primary underline-offset-4 hover:underline"
          >
            {error.action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
