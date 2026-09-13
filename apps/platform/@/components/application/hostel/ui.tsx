import {
  CheckCheck,
  CircleCheck,
  CircleX,
  Clock,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import type { OutPassType } from "~/models/hostel_n_outpass";

export const campusFormat = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions
) =>
  new Intl.DateTimeFormat("en-IN", {
    ...options,
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));

export const shortDateTime = (date: string | Date) =>
  campusFormat(date, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export const REASON_LABEL: Record<OutPassType["reason"], string> = {
  outing: "Outing",
  market: "Market",
  home: "Home",
  medical: "Medical",
  other: "Other",
};

export const OUTPASS_STATUS_META: Record<
  OutPassType["status"],
  { label: string; tone: string; Icon: typeof Clock }
> = {
  pending: { label: "Pending", tone: "text-warning", Icon: Clock },
  approved: { label: "Approved", tone: "text-success", Icon: CircleCheck },
  rejected: { label: "Rejected", tone: "text-destructive", Icon: CircleX },
  in_use: { label: "Out now", tone: "text-info", Icon: LogOut },
  processed: {
    label: "Returned",
    tone: "text-muted-foreground",
    Icon: CheckCheck,
  },
};

export function OutpassStatusTag({
  status,
  className,
}: {
  status: OutPassType["status"];
  className?: string;
}) {
  const meta = OUTPASS_STATUS_META[status] ?? OUTPASS_STATUS_META.pending;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-2 text-caption font-medium",
        meta.tone,
        className
      )}
    >
      <meta.Icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function TableFrame({
  children,
  caption,
  className,
}: {
  children: React.ReactNode;
  caption: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-border bg-card dark:bg-background",
        className
      )}
    >
      <table className="w-full border-separate border-spacing-0 text-body">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "h-11 whitespace-nowrap border-b border-border bg-card px-4 text-left text-caption font-medium text-muted-foreground dark:bg-background",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "border-b border-border px-4 py-3 align-middle group-last/row:border-b-0",
        className
      )}
    >
      {children}
    </td>
  );
}

export function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <Button variant="outline" size="icon_sm" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <ButtonLink
      href={href}
      variant="outline"
      size="icon_sm"
      aria-label={label}
      scroll={false}
    >
      {children}
    </ButtonLink>
  );
}

export function AccessNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 dark:bg-background"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-destructive">
        <ShieldAlert className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-body-lg font-medium text-foreground">{title}</p>
        <p className="text-body text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 dark:bg-background">
      <p className="text-caption font-medium text-muted-foreground">{label}</p>
      <p className="font-heading text-heading-sm font-medium tabular-nums text-foreground">
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>
      {hint && <p className="text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
}
