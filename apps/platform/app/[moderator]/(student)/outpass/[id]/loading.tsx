import { Skeleton } from "@/components/ui/skeleton";
import { OutpassDetailSkeleton } from "../skeletons";

export default function Loading() {
  return (
    <div className="@container flex w-full flex-col gap-8">
      <div className="flex items-start gap-3 border-b border-border pb-6">
        <Skeleton className="size-10 rounded-lg bg-muted" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 bg-muted" />
          <Skeleton className="h-4 w-48 bg-muted" />
        </div>
      </div>
      <OutpassDetailSkeleton />
    </div>
  );
}
