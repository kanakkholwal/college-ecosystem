import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

export type StatsCardProps = {
  title: string;
  children: React.ReactNode;
  description?: string | React.ReactNode;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>> | React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive";
};

function CardIcon({ Icon }: { Icon: StatsCardProps["Icon"] }) {
  if (!Icon) return null;
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground [&_svg]:size-4">
      {typeof Icon === "function" ? <Icon aria-hidden="true" /> : Icon}
    </span>
  );
}

export function StatsCard({
  title,
  children,
  description,
  Icon,
  action,
  className,
  variant = "default",
}: StatsCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background",
        variant === "destructive" && "border-destructive/40",
        className
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-body-lg font-medium text-foreground">{title}</h3>
          {description && (
            <p className="text-body text-muted-foreground">{description}</p>
          )}
        </div>
        <CardIcon Icon={Icon} />
      </header>
      <div className="flex items-end justify-between gap-3">
        <div className="w-full min-w-0">{children}</div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  );
}

export const StatCardSimple = ({
  title,
  children,
  description,
  Icon,
  action,
  className,
}: StatsCardProps) => (
  <div
    className={cn(
      "flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 dark:bg-background",
      className
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <p className="text-body font-medium text-muted-foreground">{title}</p>
      <CardIcon Icon={Icon} />
    </div>
    <div className="flex items-end justify-between gap-3">
      <div className="w-full min-w-0">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    {description && (
      <p className="text-caption text-muted-foreground">{description}</p>
    )}
  </div>
);

export type KpiDelta = {
  /** Signed change; the sign picks the glyph. */
  value: number;
  /** Rendered after the number, e.g. "%" or " pts". */
  unit?: string;
  /** Comparison window, e.g. "vs last week". */
  period: string;
  /** When a rise is bad news (pending queues), flip the tone. */
  invert?: boolean;
};

export type KpiCardProps = {
  label: string;
  value: number | string | null;
  /** Context under the number: what it counts and over which window. */
  hint?: React.ReactNode;
  delta?: KpiDelta;
  /** Ordered values drawn as a sparkline, oldest first. */
  trend?: number[];
  href?: string;
  className?: string;
};

export function DeltaText({ value, unit = "", period, invert }: KpiDelta) {
  const rounded = Math.round(value * 100) / 100;
  const Glyph = rounded > 0 ? TrendingUp : rounded < 0 ? TrendingDown : Minus;
  const good = invert ? rounded < 0 : rounded > 0;
  const bad = invert ? rounded > 0 : rounded < 0;
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-caption">
      <span
        className={cn(
          "inline-flex items-center gap-1 font-medium tabular-nums",
          good && "text-success",
          bad && "text-destructive",
          !good && !bad && "text-muted-foreground"
        )}
      >
        <Glyph className="size-3.5" aria-hidden="true" />
        {rounded > 0 ? "+" : ""}
        {rounded.toLocaleString("en-IN")}
        {unit}
      </span>
      <span className="text-muted-foreground">{period}</span>
    </span>
  );
}

/** Server-rendered SVG so a KPI row ships no chart JavaScript. */
export function Sparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  if (values.length < 2) return null;
  const width = 96;
  const height = 32;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - 2 - ((v - min) / span) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-8 w-24 shrink-0 overflow-visible", className)}
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="var(--chart-1)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  delta,
  trend,
  href,
  className,
}: KpiCardProps) {
  const display =
    value === null
      ? "No data yet"
      : typeof value === "number"
        ? value.toLocaleString("en-IN")
        : value;
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-body font-medium text-muted-foreground">{label}</p>
        {href && (
          <ArrowRight
            className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <p
          className={cn(
            "font-heading font-medium tabular-nums text-foreground",
            value === null ? "text-body-lg" : "text-heading"
          )}
        >
          {display}
        </p>
        {trend && <Sparkline values={trend} />}
      </div>
      {(delta || hint) && (
        <div className="flex flex-col gap-0.5">
          {delta && <DeltaText {...delta} />}
          {hint && <p className="text-caption text-muted-foreground">{hint}</p>}
        </div>
      )}
    </>
  );
  const base =
    "flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 dark:bg-background";
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "group outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        {body}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{body}</div>;
}

export function KpiGrid({
  children,
  className,
  label = "Key numbers",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <section aria-label={label}>
      <div
        className={cn(
          "grid grid-cols-1 gap-3 @sm:grid-cols-2 @4xl:grid-cols-4",
          className
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function KpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @4xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
          key={i}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 dark:bg-background"
        >
          <Skeleton className="h-4 w-24 bg-muted" />
          <Skeleton className="h-9 w-20 bg-muted" />
          <Skeleton className="h-3 w-32 bg-muted" />
        </div>
      ))}
    </div>
  );
}
