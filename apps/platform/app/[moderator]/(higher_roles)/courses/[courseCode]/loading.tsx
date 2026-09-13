import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <div className="flex items-start gap-3 border-b border-border pb-6">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="hidden flex-col gap-1 lg:flex">
          {["basics", "credits", "outcomes", "units", "refs"].map((key) => (
            <Skeleton key={key} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex flex-col gap-6">
          {["basics", "credits", "units"].map((key) => (
            <div
              key={key}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 md:p-6 dark:bg-background"
            >
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
