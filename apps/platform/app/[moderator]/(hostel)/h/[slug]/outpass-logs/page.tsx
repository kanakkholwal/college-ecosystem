"use client";

import { HeaderBar } from "@/components/common/header-bar";
import { DataTable } from "@/components/ui/data-table"; // Ensure your DataTable accepts className/style props
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/utils/error-boundary";
import { FileClock, History } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getOutPassHistoryForHostel } from "~/actions/hostel.outpass";
import type { OutPassType } from "~/models/hostel_n_outpass";
import { columns } from "./columns";
import { OutpassToolbar } from "./toolbar";

// Function to fetch outpass based on search parameters
async function fetchOutpass(searchParams: {
  query?: string;
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}) {
  return await getOutPassHistoryForHostel({
    query: searchParams.query,
    offset: searchParams.offset,
    limit: searchParams.limit,
    sortBy: searchParams.sortDirection || "desc", 
  });
}

export default function OutPassHistoryPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<OutPassType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Extract params to ensure stability in dependency array
  const queryParam = searchParams.get("query");
  const offsetParam = searchParams.get("offset");
  const limitParam = searchParams.get("limit");
  const sortParam = searchParams.get("sortDirection");

  useEffect(() => {
    const query = {
      query: queryParam || "",
      offset: Number.parseInt(offsetParam || "0", 10),
      limit: Number.parseInt(limitParam || "100", 10),
      sortDirection: (sortParam as "asc" | "desc") || "desc",
    };

    setLoading(true);
    fetchOutpass(query)
      .then((res) => {
        if(res?.data) {
            setData(res.data || []);
            setError(null);
        } else {
            setError(res.error || "Failed to load data");
        }
      })
      .catch((err) => {
        setError(err?.message || "Error fetching data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [queryParam, offsetParam, limitParam, sortParam]);

  return (
    <div className="space-y-6 my-6 w-full max-w-[1600px] mx-auto px-4 sm:px-6">
       {/* --- Header Section --- */}
       <HeaderBar
        Icon={History}
        titleNode={
          <div className="flex items-center gap-2">
             <h1 className="text-2xl font-bold tracking-tight text-foreground">Outpass Logs</h1>
          </div>
        }
        descriptionNode="View and audit past entry/exit records for students."
      />

      {/* --- Main Content Area --- */}
      <div className="flex flex-col space-y-4">
        
        {/* Toolbar handles Search, Sort, and View Options */}
        <OutpassToolbar />

        {loading ? (
           <TableSkeleton />
        ) : (
          <ErrorBoundary
            fallback={
              <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed bg-muted/30 p-8 text-center animate-in fade-in-50">
                <FileClock className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Unable to load logs</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">{error}</p>
              </div>
            }
          >
            <div className="rounded-xl bg-card shadow-sm overflow-hidden">
                <DataTable 
                    data={data} 
                    columns={columns} 
                />
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}

function TableSkeleton() {
    return (
        <div className="space-y-3">
            <div className="rounded-xl border bg-card">
                <div className="p-4 border-b space-y-3">
                    <Skeleton className="h-8 w-[250px]" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b last:border-0">
                         <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                         </div>
                         <Skeleton className="h-4 w-24" />
                         <Skeleton className="h-6 w-16 rounded-full" />
                         <Skeleton className="h-8 w-8" />
                    </div>
                ))}
            </div>
        </div>
    )
}