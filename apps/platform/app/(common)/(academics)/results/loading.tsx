import { SkeletonCard } from "@/components/application/result/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingResultPage() {
  return (
    <div className="@container mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pb-12 md:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center py-12 sm:py-16">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-4 h-10 w-72 md:h-12" />
        <Skeleton className="mt-2 h-10 w-40 md:h-12" />
        <Skeleton className="mt-4 h-5 w-full max-w-md" />
        <Skeleton className="mt-8 h-32 w-full rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={`skeleton-${i.toString()}`} />
        ))}
      </div>
    </div>
  );
}
