"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface DataTablePaginationProps {
  totalCount: number;
  pageSize: number;
  pageIndex: number; // 0-based index
  disabled?: boolean;
}

export function DataTablePagination({
  totalCount,
  pageSize,
  pageIndex,
  disabled,
}: DataTablePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const pageCount = Math.ceil(totalCount / pageSize);
  const isLoading = disabled || isPending;

  // Helper to update URL
  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => params.set(key, value));
    
    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Mobile: Simple count */}
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {Math.min(pageIndex * pageSize + 1, totalCount)} -{" "}
        {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount} rows
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        
        {/* Rows Per Page Selector */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              updateUrl({ 
                  limit: value, 
                  offset: "0" // Reset to first page on size change
              });
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page X of Y */}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pageIndex + 1} of {pageCount}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => updateUrl({ offset: "0" })}
            disabled={pageIndex === 0 || isLoading}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => updateUrl({ offset: `${(pageIndex - 1) * pageSize}` })}
            disabled={pageIndex === 0 || isLoading}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => updateUrl({ offset: `${(pageIndex + 1) * pageSize}` })}
            disabled={pageIndex >= pageCount - 1 || isLoading}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => updateUrl({ offset: `${(pageCount - 1) * pageSize}` })}
            disabled={pageIndex >= pageCount - 1 || isLoading}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}