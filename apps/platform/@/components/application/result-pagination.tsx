"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

interface PaginateProps {
  totalPages: number;
  className?: string;
}

export default function Paginate({ totalPages, className }: PaginateProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  // 1. Safe parsing of current page
  const currentPage = useMemo(() => {
    const page = Number(searchParams.get("page"));
    return isNaN(page) || page < 1 ? 1 : page;
  }, [searchParams]);

  // 2. Optimized URL Generator
  const createPageURL = useCallback((pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  }, [pathname, searchParams]);

  // 3. Single-pass Range Generator
  const paginationRange = useMemo(() => {
    const delta = 1; // Pages to show on sides of current
    const range: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  }, [currentPage, totalPages]);

  return (
    <Pagination className={cn("w-auto", className)}>
      <PaginationContent className="gap-1">

        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            href={currentPage <= 1 ? "#" : createPageURL(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            size="sm"
            className={cn(
              "rounded-lg border border-border/40 transition-all hover:bg-muted/50",
              currentPage <= 1 && "pointer-events-none opacity-40"
            )}
          >
            <ChevronLeft  />
          </PaginationPrevious>
        </PaginationItem>

        {/* Desktop: Standard Range */}
        <div className="hidden sm:flex gap-1">
          {paginationRange.map((pageNumber, i) => {
            if (pageNumber === "...") {
              return (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis className="text-muted-foreground/40" />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href={createPageURL(pageNumber)}
                  isActive={pageNumber === currentPage}
                  className={cn(
                    "rounded-lg border border-transparent font-mono text-xs transition-all",
                    pageNumber === currentPage
                      ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border/40"
                  )}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
        </div>

        {/* Mobile: Compact Indicator */}
        <div className="flex sm:hidden items-center px-2">
          <span className="text-sm text-muted-foreground font-medium">
            <span className="text-foreground">{currentPage}</span> / {totalPages}
          </span>
        </div>

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            href={currentPage >= totalPages ? "#" : createPageURL(currentPage + 1)}
            aria-disabled={currentPage >= totalPages}
            size="sm"
            className={cn(
              "rounded-lg border border-border/40 transition-all hover:bg-muted/50",
              currentPage >= totalPages && "pointer-events-none opacity-40"
            )}
          >
            <ChevronRight />
          </PaginationNext>
        </PaginationItem>

        {/* Jump To (Desktop Only) */}
        <div className="hidden sm:block pl-1">
          <JumpToPage totalPages={totalPages} onJump={(p) => replace(createPageURL(p))} />
        </div>

      </PaginationContent>
    </Pagination>
  );
}

// --- Optimized Sub-component ---
function JumpToPage({ totalPages, onJump }: { totalPages: number, onJump: (page: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [val, setVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(val);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onJump(p);
      setIsOpen(false);
      setVal("");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
          title="Jump to page"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3" align="end" sideOffset={8}>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Jump to
            </span>
            <span className="text-[10px] text-muted-foreground/50">
              Max {totalPages}
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              autoFocus
              type="number"
              min={1}
              max={totalPages}
              placeholder="#"
              className="h-8 text-xs font-mono"
              value={val}
              onChange={(e) => setVal(e.target.value)}
            />
            <Button type="submit" size="sm" className="h-8 px-3 text-xs" disabled={!val}>
              Go
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}