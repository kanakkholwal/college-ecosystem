import { PanelSkeleton } from "@/components/application/dashboard/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventLoading() {
  return (
    <div className="@container flex flex-col gap-8" aria-busy="true">
      <Skeleton className="h-9 w-28 rounded-md bg-muted" />
      <div className="flex items-start gap-3 border-b border-border pb-6">
        <Skeleton className="size-10 rounded-lg bg-muted" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-8 w-2/3 max-w-md bg-muted" />
          <Skeleton className="h-5 w-40 bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-4 @4xl:grid-cols-[minmax(0,1fr)_22rem]">
        <PanelSkeleton rows={4} />
        <PanelSkeleton rows={2} />
      </div>
    </div>
  );
}
