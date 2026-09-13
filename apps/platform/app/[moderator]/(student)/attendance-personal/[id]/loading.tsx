import { PanelSkeleton } from "@/components/application/dashboard/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="@container flex w-full flex-col gap-8" aria-busy="true">
      <div className="flex items-start gap-3 border-b border-border pb-6">
        <Skeleton className="size-10 rounded-lg bg-muted" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-56 bg-muted" />
          <Skeleton className="h-4 w-40 bg-muted" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-5">
          <PanelSkeleton className="@3xl:col-span-2" rows={3} />
          <PanelSkeleton className="@3xl:col-span-3" rows={4} />
        </div>
        <PanelSkeleton rows={5} />
      </div>
    </div>
  );
}
