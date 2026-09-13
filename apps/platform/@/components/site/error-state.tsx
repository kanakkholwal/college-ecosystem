"use client";

import { LostBlock } from "@/components/illustrations/lost-block";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  DoorOpen,
  GraduationCap,
  Home,
  RotateCw,
} from "lucide-react";
import Link from "next/link";
import { appConfig } from "~/project.config";

const popular = [
  { title: "Results", href: "/results", Icon: GraduationCap },
  { title: "Syllabus", href: "/syllabus", Icon: BookOpen },
  {
    title: "Classroom finder",
    href: "/classroom-availability",
    Icon: DoorOpen,
  },
  { title: "Time tables", href: "/schedules", Icon: CalendarDays },
];

type ErrorStateProps = {
  variant: "404" | "error";
  error?: Error & { digest?: string };
  reset?: () => void;
  className?: string;
};

export function ErrorState({
  variant,
  error,
  reset,
  className,
}: ErrorStateProps) {
  const notFound = variant === "404";
  const hasDetails = !notFound && (error?.digest || error?.message);

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.assign("/");
  };

  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16",
        className
      )}
    >
      <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col items-start">
          <span className="mb-4 w-fit -rotate-2 rounded-md border border-border bg-background px-2.5 py-1 text-caption font-semibold tabular-nums text-foreground">
            {notFound ? "Error 404" : "Unexpected error"}
          </span>

          <h1 className="text-balance text-heading-lg font-medium text-foreground md:text-display">
            {notFound ? (
              <>
                This page is <span className="text-primary">missing</span>
              </>
            ) : (
              <>
                Something <span className="text-primary">went wrong</span>
              </>
            )}
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">
            {notFound
              ? "The link may be mistyped, or the page has moved."
              : "The page failed to load. Try again, or head back home."}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3">
            {notFound ? (
              <>
                <ButtonLink variant="primary" href="/">
                  <Home aria-hidden="true" />
                  Home
                </ButtonLink>
                <Button variant="outline" onClick={goBack}>
                  <ArrowLeft aria-hidden="true" />
                  Go back
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  onClick={() => (reset ? reset() : window.location.reload())}
                >
                  <RotateCw aria-hidden="true" />
                  Try again
                </Button>
                <ButtonLink variant="outline" href="/">
                  <Home aria-hidden="true" />
                  Home
                </ButtonLink>
              </>
            )}
          </div>

          {hasDetails && (
            <details className="group mt-6 w-full max-w-xl">
              <summary className="w-fit cursor-pointer list-none rounded-md text-body text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Show error details</span>
                <span className="hidden group-open:inline">
                  Hide error details
                </span>
              </summary>
              <dl className="mt-3 flex flex-col gap-2 rounded-lg border border-border bg-muted px-3 py-2.5 font-mono text-caption text-foreground">
                {error?.digest && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground">Digest</dt>
                    <dd className="break-all">{error.digest}</dd>
                  </div>
                )}
                {error?.message && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted-foreground">Message</dt>
                    <dd className="break-all">{error.message}</dd>
                  </div>
                )}
              </dl>
            </details>
          )}
        </div>

        {notFound && (
          <section
            className="flex flex-col gap-3"
            aria-labelledby="error-popular"
          >
            <h2
              id="error-popular"
              className="text-body font-medium text-muted-foreground"
            >
              Popular pages
            </h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {popular.map(({ title, href, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 pr-3 outline-none transition-[border-color,box-shadow] duration-200 ease-craft hover:border-border-strong hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-background"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors duration-200 group-hover:text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-body font-medium text-foreground">
                      {title}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-craft group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-body text-muted-foreground">
          Still stuck?{" "}
          <a
            href={`${appConfig.githubRepo}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Report it on GitHub
          </a>
        </p>
      </div>

      <div className="hidden min-w-0 items-center justify-center lg:flex">
        <LostBlock className="max-h-112 max-w-sm" />
      </div>
    </div>
  );
}
