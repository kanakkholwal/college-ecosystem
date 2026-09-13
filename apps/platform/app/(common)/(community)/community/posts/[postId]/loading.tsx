import { CommentsSkeleton } from "@/components/application/community/post-comments";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl pt-6">
      <Skeleton className="mb-6 h-9 w-44" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-8 w-11/12 md:h-10" />
      <Skeleton className="mt-2 h-8 w-2/3 md:h-10" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/5" />
      </div>
      <div className="mt-8 flex items-center justify-between border-y border-border py-1.5">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-16 rounded-full" />
          <Skeleton className="h-10 w-16 rounded-full" />
          <Skeleton className="h-10 w-16 rounded-full" />
        </div>
        <Skeleton className="h-10 w-20" />
      </div>
      <Skeleton className="mt-10 mb-4 h-8 w-36" />
      <CommentsSkeleton />
    </div>
  );
}
