import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pt-6 pb-16 md:px-6">
      <Skeleton className="mb-6 h-9 w-24" />
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
        <div className="flex items-start gap-4">
          <Skeleton className="hidden size-14 rounded-2xl md:block" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-80 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-12">
        <Skeleton className="h-44 rounded-2xl md:col-span-4 lg:col-span-3" />
        <Skeleton className="h-44 rounded-2xl md:col-span-8 lg:col-span-5" />
        <Skeleton className="h-44 rounded-2xl md:col-span-12 lg:col-span-4" />
      </div>
      <div className="mt-10 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={`sem-${i.toString()}`} className="h-18 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
