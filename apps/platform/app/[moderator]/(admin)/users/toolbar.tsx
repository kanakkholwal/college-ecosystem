"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Cross2Icon } from "@radix-ui/react-icons";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "use-debounce"; // Use your custom hook path

export function UsersToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 1. Search State
  const [text, setText] = useState(searchParams.get("searchValue") || "");
  const [field, setField] = useState(searchParams.get("searchField") || "email");
  const [sortDir, setSortDir] = useState(searchParams.get("sortDirection") || "desc");

  // 2. Debounce the search text (300ms delay)
  // useDebounce from 'use-debounce' returns a tuple; destructure the debounced value
  const [query] = useDebounce(text, 300);

  // 3. Sync with URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set("searchValue", query);
      // Only set field if we are actually searching
      params.set("searchField", field);
    } else {
      params.delete("searchValue");
      // Optional: keep field in URL or remove it. Keeping it is usually better UX.
    }

    params.set("sortDirection", sortDir);

    // Reset pagination if the search query changes
    if (query !== searchParams.get("searchValue")) {
      params.set("offset", "0");
    }

    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  }, [query, field, sortDir, router, searchParams]);

  // 4. Handlers
  const isFiltered = !!query || sortDir !== "desc" || field !== "email";

  const handleReset = () => {
    setText("");
    setField("email");
    setSortDir("desc");
    router.replace("?");
  };

  const toggleSort = () => {
    setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1">
      
      {/* Search Group */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="pl-9 h-9 bg-background"
          />
          {isPending && (
            <div className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </div>

        {/* Search Field Selector */}
        {/* Separated from Input to avoid border glitches */}
        <Select value={field} onValueChange={setField}>
          <SelectTrigger className="h-9 w-[100px] text-xs">
            <span className="text-muted-foreground mr-1">By:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Actions */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSort}
          className="h-9 gap-2 text-muted-foreground hover:text-foreground"
        >
          {sortDir === "desc" ? (
            <>
              <ArrowDownWideNarrow className="h-3.5 w-3.5" /> Newest
            </>
          ) : (
            <>
              <ArrowUpNarrowWide className="h-3.5 w-3.5" /> Oldest
            </>
          )}
        </Button>

        {isFiltered && (
          <>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 px-2 text-muted-foreground hover:text-destructive"
            >
              <span className="sr-only lg:not-sr-only text-xs">Reset</span>
              <Cross2Icon className="ml-2 h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}