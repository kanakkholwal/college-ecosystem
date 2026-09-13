import { CommentsSkeleton } from "@/components/application/community/post-comments";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl pt-6">
      <Skeleton className="mb-6 h-9 w-28" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-8 w-11/12 md:h-10" />
      <Skeleton className="mt-3 h-5 w-2/3" />
      <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:p-6 dark:bg-background">
        <Skeleton className="mb-2 h-3 w-20" />
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton
            key={`loading-option-${i.toString()}`}
            className="h-11 w-full rounded-xl"
          />
        ))}
        <div className="mt-1 flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <Skeleton className="mt-3 h-11 w-full rounded-2xl" />
      <Skeleton className="mt-10 mb-4 h-8 w-36" />
      <CommentsSkeleton />
    </div>
  );
}
