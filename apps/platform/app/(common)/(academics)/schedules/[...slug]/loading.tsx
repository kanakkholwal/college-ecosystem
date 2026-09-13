import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingTimetable() {
  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pt-6 pb-16 md:px-6">
      <Skeleton className="mb-6 h-9 w-24 rounded-full" />
      <div className="flex flex-col gap-3 border-b border-border pb-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      <Skeleton className="mt-8 h-8 w-48" />
      <Skeleton className="mt-4 h-11 w-full rounded-xl" />

      <Skeleton className="mt-4 h-16 w-full rounded-2xl md:hidden" />
      <div className="mt-4 flex flex-col gap-2 md:hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={`agenda-${i.toString()}`}
            className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-3"
          >
            <Skeleton className="mt-4 ml-auto h-5 w-14" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ))}
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-border bg-card md:block dark:bg-background">
        <div className="grid h-12 grid-cols-[4.5rem_repeat(5,minmax(0,1fr))] items-center gap-4 border-b border-border px-4">
          <span />
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton
              key={`day-${i.toString()}`}
              className="mx-auto h-4 w-16"
            />
          ))}
        </div>
        <div className="grid grid-cols-[4.5rem_repeat(5,minmax(0,1fr))] gap-2 p-2">
          {Array.from({ length: 36 }, (_, i) =>
            i % 6 === 0 ? (
              <Skeleton key={`cell-${i.toString()}`} className="h-4 w-12" />
            ) : (
              <Skeleton
                key={`cell-${i.toString()}`}
                className="h-18 rounded-lg"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
