import { PostCardSkeleton } from "@/components/application/community/post-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pt-6 pb-16 md:px-6">
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
        <div className="flex items-start gap-4">
          <Skeleton className="size-16 rounded-full md:size-20" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-56 md:h-10 md:w-72" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-80 max-w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <PostCardSkeleton key={`post-skeleton-${i.toString()}`} />
        ))}
      </div>
    </div>
  );
}
