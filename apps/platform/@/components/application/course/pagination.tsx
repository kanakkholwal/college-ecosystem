"use client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { usePathname, useSearchParams } from "next/navigation";

export default function Paginate({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };
  const displayPageRange = 3; // Adjust this value based on how many pages you want to show around the current page.

  return (
    <Pagination>
      <PaginationContent className="flex-wrap">
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={currentPage <= 1}
            href={currentPage <= 1 ? "#" : createPageURL(currentPage - 1)}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNumber = i + 1;

          // Show only a specific range around the current page, add ellipsis for others
          if (
            pageNumber === 1 ||
            pageNumber === totalPages ||
            (pageNumber >= currentPage - displayPageRange &&
              pageNumber <= currentPage + displayPageRange)
          ) {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <PaginationItem key={i}>
                <PaginationLink
                  href={createPageURL(pageNumber)}
                  isActive={pageNumber === currentPage}
                  size="icon_sm"
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          }
          if (
            pageNumber === currentPage - displayPageRange - 1 ||
            pageNumber === currentPage + displayPageRange + 1
          ) {
            // Show ellipsis
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            return <PaginationEllipsis key={i} />;
          }

          return null;
        })}
        <PaginationItem>
          <PaginationNext
            aria-disabled={currentPage >= totalPages}
            href={
              currentPage >= totalPages ? "#" : createPageURL(currentPage + 1)
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
