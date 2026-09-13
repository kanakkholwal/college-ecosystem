import { PanelSkeleton } from "@/components/application/dashboard/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export function OutpassListSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40 bg-muted" />
          <Skeleton className="h-4 w-56 bg-muted" />
        </div>
        <Skeleton className="h-11 w-44 rounded-md bg-muted" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-40 bg-muted" />
        <PanelSkeleton rows={4} />
      </div>
    </div>
  );
}

export function OutpassDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-5" aria-busy="true">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 dark:bg-background @3xl:col-span-3">
        <Skeleton className="h-8 w-40 rounded-full bg-muted" />
        <Skeleton className="h-8 w-56 bg-muted" />
        <Skeleton className="h-5 w-32 bg-muted" />
        <Skeleton className="h-24 w-full rounded-xl bg-muted" />
        <Skeleton className="h-20 w-full rounded-xl bg-muted" />
      </div>
      <PanelSkeleton className="@3xl:col-span-2" rows={4} />
    </div>
  );
}
