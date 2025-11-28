"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger
} from "@/components/ui/select";
import { Cross2Icon } from "@radix-ui/react-icons";
import { ArrowUpDown, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function OutpassToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for immediate input feedback
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [sort, setSort] = useState(searchParams.get("sortDirection") || "desc");

  // Debounce search to prevent API spam
  // If you don't have useDebounce, just remove it and trigger on Enter key or blur
  // const debouncedQuery = useDebounce(query, 300); 

  const handleSearch = (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set("query", term);
      } else {
        params.delete("query");
      }
      // Reset offset on new search
      params.set("offset", "0");
      
      startTransition(() => {
        router.replace(`?${params.toString()}`);
      });
  };

  const handleSort = (value: string) => {
      setSort(value);
      const params = new URLSearchParams(searchParams.toString());
      params.set("sortDirection", value);
      startTransition(() => {
        router.replace(`?${params.toString()}`);
      });
  }

  const handleReset = () => {
      setQuery("");
      setSort("desc");
      router.replace("?");
  }

  const isFiltered = !!query || sort !== "desc";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1">
      
      {/* Search Input Area */}
      <div className="relative w-full sm:w-72 lg:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by student name or roll number..."
          value={query}
          onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e.target.value); // Or use debounce here
          }}
          className="pl-9 h-9 focus-visible:ring-offset-0 focus-visible:border-primary transition-all"
        />
      </div>

      {/* Actions Area */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
         
         {/* Sort Dropdown */}
         <Select value={sort} onValueChange={handleSort}>
            <SelectTrigger className="h-9 w-[160px] text-xs font-medium border-dashed">
                <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">
                        {sort === "desc" ? "Newest First" : "Oldest First"}
                    </span>
                </div>
            </SelectTrigger>
            <SelectContent align="end">
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
         </Select>

         {/* Reset Button */}
         {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-primary"
            >
              <span className="sr-only lg:not-sr-only text-xs">Reset</span>
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
         )}
      </div>
    </div>
  );
}