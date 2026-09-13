import { ArrowRight, Building2, Lock } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HostelType } from "~/models/hostel_n_outpass";

interface HostelCardProps {
  hostel: HostelType;
  href: string;
  disabled: boolean;
}

const GENDER_LABEL: Record<HostelType["gender"], string> = {
  male: "Boys",
  female: "Girls",
  guest_hostel: "Guest",
};

export function HostelCard({ hostel, href, disabled }: HostelCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground">
          <Building2 className="size-5" aria-hidden="true" />
        </span>
        <span className="inline-flex h-6 items-center gap-1 rounded-full border border-border px-2 text-caption font-medium text-foreground">
          {disabled && <Lock className="size-3" aria-hidden="true" />}
          {disabled ? "No access" : (GENDER_LABEL[hostel.gender] ?? "Hostel")}
        </span>
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-body-lg font-medium text-foreground">
          {hostel.name}
        </h3>
        <p className="truncate text-body text-muted-foreground">
          Warden: {hostel.warden?.name || "Not assigned"}
        </p>
      </div>
      <p className="mt-auto flex items-center justify-between text-caption text-muted-foreground">
        {hostel.administrators?.length ?? 0} other staff
        {!disabled && (
          <ArrowRight
            className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        )}
      </p>
    </>
  );

  const base =
    "flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 dark:bg-background";

  if (disabled) {
    return (
      <div className={cn(base, "text-muted-foreground")} aria-disabled="true">
        {body}
      </div>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        base,
        "group outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {body}
    </Link>
  );
}

export function HostelGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
          key={i}
          className="flex h-44 flex-col gap-3 rounded-2xl border border-border bg-card p-5 dark:bg-background"
        >
          <div className="flex justify-between">
            <Skeleton className="size-10 rounded-lg bg-muted" />
            <Skeleton className="h-6 w-14 rounded-full bg-muted" />
          </div>
          <Skeleton className="h-5 w-3/4 bg-muted" />
          <Skeleton className="h-4 w-1/2 bg-muted" />
        </div>
      ))}
    </div>
  );
}
