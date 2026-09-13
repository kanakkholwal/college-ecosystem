import { Skeleton } from "@/components/ui/skeleton";

export default function CoursePageLoader() {
  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pt-6 pb-16 md:px-6">
      <Skeleton className="mb-6 h-5 w-64 max-w-full" />
      <div className="flex items-end justify-between gap-8 border-b border-border pb-8">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-10 w-full max-w-lg md:h-12" />
          <div className="mt-6 flex flex-wrap gap-8">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={`meta-${i.toString()}`} className="space-y-1.5">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="hidden size-48 shrink-0 rounded-2xl md:block lg:size-56" />
      </div>
      <div className="mt-10 mb-4 flex items-center justify-between gap-4">
        <Skeleton className="hidden h-8 w-48 sm:block" />
        <Skeleton className="h-9 w-72 max-w-full" />
      </div>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card dark:bg-background">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={`chapter-${i.toString()}`}
            className="flex items-start gap-4 p-4 sm:p-5"
          >
            <Skeleton className="h-5 w-6" />
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-6 w-2/3" />
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
