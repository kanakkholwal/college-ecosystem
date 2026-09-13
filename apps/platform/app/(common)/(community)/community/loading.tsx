import { PostCardSkeleton } from "@/components/application/community/post-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="flex flex-col items-start border-b border-border py-10 sm:py-12">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-4 h-10 w-72 max-w-full md:h-24 md:w-md" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        <Skeleton className="mt-6 h-10 w-28" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-52 rounded-lg" />
          </div>
          {Array.from({ length: 3 }, (_, i) => (
            <PostCardSkeleton key={`loading-post-${i.toString()}`} />
          ))}
        </div>
        <div className="hidden flex-col gap-3 lg:flex">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      </div>
    </>
  );
}
