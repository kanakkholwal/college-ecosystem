import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type React from "react";

/** Hairline label chip, tilted. At most two per view. */
export function TiltedChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex w-fit -rotate-2 items-center gap-2 rounded-md border border-border p-0.5 pl-2.5 text-caption font-semibold text-foreground",
        className
      )}
    >
      <span>{children}</span>
      <span className="rounded-sm border border-border bg-background p-1">
        <Check className="size-3.5" aria-hidden="true" />
      </span>
    </span>
  );
}

type PageHeroProps = {
  badge?: React.ReactNode;
  title: string;
  /** Second line of the title, set in the brand colour. */
  accent?: string;
  lede?: string;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
};

export function PageHero({
  badge,
  title,
  accent,
  lede,
  actions,
  aside,
  className,
}: PageHeroProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-10 px-1 pt-28 pb-6 sm:px-4 sm:pt-32 sm:pb-10 lg:px-16",
        aside && "lg:grid-cols-2 lg:items-center",
        className
      )}
    >
      <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
        {badge && <TiltedChip className="mb-4">{badge}</TiltedChip>}
        <h1 className="text-balance text-heading-lg font-medium text-foreground md:text-display">
          {title}
          {accent && (
            <>
              <br />
              <span className="text-primary">{accent}</span>
            </>
          )}
        </h1>
        {lede && (
          <p className="mt-4 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">
            {lede}
          </p>
        )}
        {actions && (
          <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-4">
            {actions}
          </div>
        )}
      </div>
      {aside && <div className="min-w-0">{aside}</div>}
    </div>
  );
}

type SplitSectionProps = {
  title: string;
  accent?: string;
  description?: string;
  /** Keeps the title column in view while the content scrolls. */
  sticky?: boolean;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function SplitSection({
  title,
  accent,
  description,
  sticky = false,
  aside,
  className,
  children,
}: SplitSectionProps) {
  return (
    <div
      className={cn(
        "relative w-full px-1 py-6 sm:px-4 sm:py-8 lg:px-16 lg:py-10",
        className
      )}
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-20">
        <div className="flex shrink-0 flex-col gap-2 lg:w-110">
          <div
            className={cn(
              "flex flex-col gap-2",
              sticky && "lg:sticky lg:top-28"
            )}
          >
            <h2 className="text-balance text-heading-lg font-medium text-foreground">
              {title}
              {accent && (
                <>
                  <br />
                  <span className="text-primary">{accent}</span>
                </>
              )}
            </h2>
            {description && (
              <p className="max-w-sm text-pretty text-body text-muted-foreground">
                {description}
              </p>
            )}
            {aside && <div className="mt-6">{aside}</div>}
          </div>
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

type BrandPanelProps = {
  title: string;
  body?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function BrandPanel({
  title,
  body,
  actions,
  className,
}: BrandPanelProps) {
  return (
    <section
      className={cn(
        "panel-brand relative w-full overflow-hidden rounded-3xl px-6 py-16 sm:py-20",
        className
      )}
    >
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="text-balance text-heading font-medium text-white sm:text-heading-lg md:text-display">
          {title}
        </h2>
        {body && (
          <p className="mt-4 max-w-md text-pretty text-body text-white/80">
            {body}
          </p>
        )}
        {actions && (
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
