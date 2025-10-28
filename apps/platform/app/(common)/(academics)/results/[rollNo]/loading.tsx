
import { Skeleton } from "@/components/ui/skeleton";
import { PreviousPageLink } from "@/components/utils/link";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 animate-pulse">
      {/* Hero section */}
      <section id="hero" className="w-full py-6 md:py-10 space-y-6">
          <PreviousPageLink size="sm" variant="ghost" />

        <div className="rounded-2xl bg-card/20 border border-border p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Student Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="size-16 md:size-20 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>
                </div>
              </div>
            </div>

            {/* CGPI Highlight */}
            <div className="flex flex-col justify-center items-center lg:items-end">
              <Skeleton className="w-full max-w-xs h-32 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </section>

      {/* Tabs & Semesters section */}
      <section className="mt-8 md:mt-12 mb-8 space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        <div className="flex justify-center mb-6 gap-3">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>

        {/* Accordion placeholders */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
