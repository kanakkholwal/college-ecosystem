import { PollCardSkeleton } from "@/components/application/poll/poll-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="flex flex-col items-start border-b border-border py-10 sm:py-12">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="mt-4 h-10 w-72 max-w-full md:h-24 md:w-md" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        <Skeleton className="mt-6 h-10 w-28" />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-10 w-60 rounded-lg" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <PollCardSkeleton key={`loading-poll-${i.toString()}`} />
        ))}
      </div>
    </>
  );
}
