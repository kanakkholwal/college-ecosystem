"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle, Copy, Home, MoveLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
type Props = {
  error?: Error & {
    digest?: string;
  };
  title?: string;
  description?: string;
  reset?: () => void;
};

export default function ErrorBanner({ error, title, description, reset }: Props) {
  if (error) {
    console.error(error);
  }

  return (
    <div className="flex h-full min-h-[50vh] w-full flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6 text-center">

        {/* Minimal Icon */}
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
          <AlertCircle className="size-6" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {title || "Application Error"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed text-balance">
            {description || "We encountered an issue processing your request."}
          </p>
        </div>

        {/* Technical Digest (Subtle & Functional) */}
        {error?.digest && (
          <div className="group relative mx-auto flex w-fit max-w-full items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1.5 transition-colors hover:bg-muted/60 hover:border-border">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              ID
            </span>
            <code className="truncate text-xs font-mono text-foreground">
              {error.digest}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 size-5 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => navigator.clipboard.writeText(error.digest!)}
              title="Copy Error ID"
            >
              <Copy className="size-3" />
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="h-9 px-4 text-xs"
          >
            <RefreshCcw className="mr-2 size-3.5" />
            Reload
          </Button>

          {reset && (
            <Button
              variant="default"
              size="sm"
              onClick={reset}
              className="h-9 px-4 text-xs"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}




export function ErrorActions() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
      <Button
        variant="outline"
        className="w-full sm:w-auto px-8 h-12 gap-2 border-border/60 hover:bg-muted/50"
        size="lg"
        onClick={() => router.back()}
      >
        <MoveLeft className="w-4 h-4" />
        Go Back
      </Button>

      <Button
        size="lg"
        className="w-full sm:w-auto px-8 h-12 gap-2 shadow-lg shadow-primary/20"
        asChild
      >
        <Link href="/">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}