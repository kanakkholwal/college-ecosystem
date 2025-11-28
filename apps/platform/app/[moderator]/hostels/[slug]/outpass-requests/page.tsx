"use client";

import { OutpassDetails } from "@/components/application/hostel/outpass"; // Use the new card we made
import EmptyArea from "@/components/common/empty-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConditionalRender from "@/components/utils/conditional-render";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  AlertCircle,
  FileText,
  LayoutGrid,
  RefreshCcw
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR, { type Fetcher } from "swr";
import { OUTPASS_STATUS } from "~/constants/hostel.outpass";
import type { OutPassType } from "~/models/hostel_n_outpass";
import { changeCase } from "~/utils/string";

// --- Types ---
interface OutpassResponse {
  totalPages: number;
  currentPage: number;
  totalCount: number;
  groupedOutPasses: Record<OutPassType["status"], OutPassType[]>;
}

// --- Fetcher ---
const fetcher: Fetcher<OutpassResponse, string> = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error: any = new Error("An error occurred while fetching the data.");
    error.cause = await res.json();
    error.stack = res.status.toString();
    throw error;
  }
  return res.json();
};

export default function OutPassRequestsPage() {
  const { slug } = useParams();
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const { data, error, isLoading, mutate, isValidating } = useSWR<OutpassResponse>(
    "/api/outpass/list?slug=" + slug,
    fetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: true,
      refreshInterval: 1000 * 60, // 1 minute auto-refresh
      onSuccess: () => setLastRefreshed(new Date()),
    }
  );

  const handleRefresh = () => {
    mutate();
  };

  // Helper to get count for badges safely
  const getStatusCount = (status: string) => {
    return data?.groupedOutPasses?.[status as OutPassType["status"]]?.length || 0;
  };

  return (
    <div className="space-y-6 p-1 md:p-2 min-h-[80vh]">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Outpass Management
          </h1>
          <p className="text-muted-foreground">
            Review, approve, and track student movement requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
           <span className="text-xs text-muted-foreground hidden md:inline-block">
              Updated: {format(lastRefreshed, "HH:mm:ss")}
           </span>
           <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isValidating}
              className="gap-2"
           >
              <RefreshCcw className={cn("h-3.5 w-3.5", isValidating && "animate-spin")} />
              Refresh
           </Button>
        </div>
      </div>

      {/* --- Tabs & Content --- */}
      <Tabs defaultValue={OUTPASS_STATUS[0]} className="w-full">
        
        {/* Scrollable Tab List for Mobile */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2 md:mx-0 md:px-0 md:pb-0 no-scrollbar">
            <TabsList className="w-full justify-start h-auto p-1 bg-card gap-1">
            {OUTPASS_STATUS.map((status) => {
                const count = getStatusCount(status);
                return (
                <TabsTrigger 
                    key={status} 
                    value={status} 
                    className="capitalize rounded-b-none py-2 px-3 border-b border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                    {changeCase(status, "title")}
                    {/* Badge Count - Only show if data exists or loading is done */}
                    {data && (
                        <Badge 
                            variant="default_light" 
                            className={cn(
                                "ml-2 h-5 min-w-[1.25rem] px-1 text-[10px] transition-all",
                                status === 'pending' && count > 0 && "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                                count === 0 && "opacity-50"
                            )}
                        >
                            {count}
                        </Badge>
                    )}
                </TabsTrigger>
                );
            })}
            </TabsList>
        </div>

        {/* --- Main Content Area --- */}
        <div className="mt-6 min-h-[400px]">
          
          {/* Loading Skeleton */}
          <ConditionalRender condition={isLoading}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
               ))}
            </div>
          </ConditionalRender>

          {/* Error State */}
          <ConditionalRender condition={!!error}>
            <EmptyArea
              icons={[AlertCircle]}
              title="Connection Error"
              className="border-destructive/50 bg-destructive/5 text-destructive"
              description="Failed to load outpass requests. Please check your internet connection."
              actionProps={{
                  variant: "outline",
                  className: "border-destructive/50 hover:bg-destructive/10",
                  onClick: () => mutate(),
                  children: isLoading ? "Retrying..." : "Try Again",
              }
                
              }
            />
          </ConditionalRender>

          {/* Data Success State */}
          <ConditionalRender condition={!!data}>
            {OUTPASS_STATUS.map((status) => {
              const items = data?.groupedOutPasses[status as OutPassType["status"]] || [];
              const isEmpty = items.length === 0;

              return (
                <TabsContent key={status} value={status} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* Grid Layout */}
                  {!isEmpty ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 5xl:grid-cols-4 gap-4">
                        {items.map((outpass, idx) => (
                           <div key={outpass._id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-in fade-in fill-mode-backwards">
                               <OutpassDetails
                                   outpass={outpass}
                                   actionEnabled={status === "pending"}
                               />
                           </div>
                        ))}
                     </div>
                  ) : (
                    /* Empty State per Tab */
                    <div className="py-12">
                        <EmptyArea
                            icons={[FileText]}
                            title={`No ${changeCase(status, "title")} Requests`}
                            description={`There are currently no requests with the status "${status}".`}
                        />
                    </div>
                  )}
                  
                </TabsContent>
              );
            })}
          </ConditionalRender>
          
        </div>
      </Tabs>
    </div>
  );
}