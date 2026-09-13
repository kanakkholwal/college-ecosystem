import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex w-full flex-col pt-6">
      <Skeleton className="mb-6 h-9 w-32" />
      <div className="border-b border-border pb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:col-span-8 dark:bg-background">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton
                key={`category-skeleton-${i.toString()}`}
                className="h-10 w-28 rounded-full"
              />
            ))}
          </div>
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl lg:col-span-4" />
      </div>
    </div>
  );
}
