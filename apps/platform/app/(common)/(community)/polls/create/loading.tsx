import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl pt-6">
      <Skeleton className="mb-6 h-9 w-28" />
      <div className="border-b border-border pb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      </div>
      <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6 dark:bg-background">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton
              key={`duration-skeleton-${i.toString()}`}
              className="h-10 w-20 rounded-full"
            />
          ))}
        </div>
        <div className="flex justify-end border-t border-border pt-5">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
