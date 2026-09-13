import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowRight, TriangleAlert } from "lucide-react";
import Link from "next/link";

export function DashboardRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("@container flex w-full flex-col gap-10", className)}>
      {children}
    </div>
  );
}

export function DashboardHeader({
  title,
  context,
  actions,
}: {
  title: React.ReactNode;
  context?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 @2xl:flex-row @2xl:items-end @2xl:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-heading-sm font-medium text-foreground @2xl:text-heading">
          {title}
        </h1>
        {context && (
          <p className="text-pretty text-body text-muted-foreground @2xl:text-body-lg">
            {context}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}

export function DashboardSection({
  id,
  title,
  description,
  viewAll,
  action,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: React.ReactNode;
  viewAll?: { href: string; label?: string };
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 space-y-1">
          <h2
            id={headingId}
            className="text-subheading font-medium text-foreground"
          >
            {title}
          </h2>
          {description && (
            <p className="text-body text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
        {viewAll && <ViewAllLink {...viewAll} />}
      </div>
      {children}
    </section>
  );
}

export function ViewAllLink({
  href,
  label = "View all",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-body font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
      <ArrowRight
        className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

export function Panel({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-border bg-card p-5 dark:bg-background",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function PanelTitle({
  children,
  meta,
}: {
  children: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <h3 className="text-body-lg font-medium text-foreground">{children}</h3>
      {meta}
    </div>
  );
}

export function EmptyNote({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center",
        className
      )}
    >
      {icon && (
        <span className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground [&_svg]:size-5">
          {icon}
        </span>
      )}
      <p className="text-body font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-pretty text-body text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function SectionError({ what }: { what: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 dark:bg-background"
    >
      <TriangleAlert
        className="mt-0.5 size-5 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <div>
        <p className="text-body font-medium text-foreground">
          {what} couldn't load
        </p>
        <p className="text-body text-muted-foreground">
          The rest of the dashboard still works. Refresh the page to try again.
        </p>
      </div>
    </div>
  );
}

export function PanelSkeleton({
  className,
  rows = 3,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 dark:bg-background",
        className
      )}
    >
      <Skeleton className="h-5 w-40 bg-muted" />
      {Array.from({ length: rows }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
        <Skeleton key={i} className="h-10 w-full rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export type RankedItem = { label: string; value: number };

/** Horizontal bars as HTML: labels and values stay readable text, no chart JS. */
export function RankedBars({
  items,
  total,
  limit = 6,
  unit = "users",
}: {
  items: RankedItem[];
  total?: number;
  limit?: number;
  unit?: string;
}) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  if (sorted.length === 0 || sorted.every((i) => i.value === 0)) {
    return <EmptyNote title="No data yet" />;
  }
  const sum = total ?? sorted.reduce((acc, i) => acc + i.value, 0);
  const max = sorted[0].value || 1;
  const head = sorted.slice(0, limit);
  const rest = sorted.slice(limit);

  const renderRow = (item: RankedItem) => {
    const share = sum > 0 ? Math.round((item.value / sum) * 100) : 0;
    return (
      <li key={item.label} className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3 text-body">
          <span className="truncate text-foreground">{item.label}</span>
          <span className="shrink-0 tabular-nums text-muted-foreground">
            <span className="font-medium text-foreground">
              {item.value.toLocaleString("en-IN")}
            </span>{" "}
            <span className="sr-only">{unit}, </span>
            {share}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
          />
        </div>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">{head.map(renderRow)}</ul>
      {rest.length > 0 && (
        <details className="group">
          <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-md text-body font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show {rest.length} more</span>
            <span className="hidden group-open:inline">Show fewer</span>
          </summary>
          <ul className="mt-3 flex flex-col gap-3">{rest.map(renderRow)}</ul>
        </details>
      )}
    </div>
  );
}
