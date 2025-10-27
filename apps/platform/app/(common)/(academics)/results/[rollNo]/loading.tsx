import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviousPageLink } from "@/components/utils/link";
import { ArrowDownUp } from "lucide-react";

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
      {/* Header Section */}
      <section
        id="hero"
        className="w-full py-10 flex flex-col gap-6 lg:gap-10 relative"
      >
        <div>
          <PreviousPageLink size="sm" variant="ghost" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Info Skeleton */}
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-6 w-40" />

            <div className="flex flex-wrap items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <Badge key={i} variant="outline">
                  <Skeleton className="h-4 w-16" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Performance Card Skeleton */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
            <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
              <ArrowDownUp className="size-5 text-muted-foreground" />
              <span>Performance Snapshot</span>
            </h4>

            <div className="grid grid-cols-3 gap-y-6 text-center">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mx-auto mb-2" />
                  <Skeleton className="h-5 w-12 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* Semester Results Skeleton */}
      <section className="mt-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
          Semester-wise Results
        </h2>

        <Tabs defaultValue="table" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="table">Tabular View</TabsTrigger>
              <TabsTrigger value="graph">Graphical View</TabsTrigger>
            </TabsList>
          </div>

          <Accordion type="single" collapsible className="grid gap-4">
            {[...Array(3)].map((_, semIndex) => (
              <AccordionItem
                key={semIndex}
                value={`loading-sem-${semIndex}`}
                className="bg-card border border-border/40 rounded-xl p-4"
              >
                <div className="flex justify-between flex-wrap gap-4 mb-4">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex gap-3 text-sm flex-wrap">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-20" />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, courseIndex) => (
                    <div
                      key={courseIndex}
                      className="flex justify-between items-center py-2 px-3 rounded-lg border border-border/40"
                    >
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-10 rounded-full" />
                    </div>
                  ))}
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </Tabs>
      </section>

    </div>
  );
}
