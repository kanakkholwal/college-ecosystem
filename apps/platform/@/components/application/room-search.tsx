"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IoMdOptions } from "react-icons/io";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function SearchBox() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [open, setOpen] = useState(false);
  const [current_status, setCurrentStatus] = useState(
    searchParams.get("currentStatus")?.toString()
  );

  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(`Searching... ${term}`);

    console.log(term);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleFilter = (key: string, value: string) => {
    console.log(`Searching... ${key} : ${value}`);
    setCurrentStatus(value);
    const params = new URLSearchParams(searchParams);
    if (key) {
      params.set(key, value);
    } else {
      params.delete(value);
    }
    if (value === "all") {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full grid gap-4">
      <div className="relative flex items-stretch w-full rounded-full h-auto">
        <div className="absolute top-0 bottom-0 left-0">
          <Button
            type="button"
            aria-label="Filter"
            title="Filter"
            onClick={() => setOpen(!open)}
            variant="glass"
            rounded="full"
            size="lg"
            className="border border-border"
            // className="relative flex h-12 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-gray-700 dark:before:bg-gray-800 sm:w-max"
          >
            <span className="relative text-base font-semibold text-primary">
              <IoMdOptions className="w-5 h-5" />
            </span>
          </Button>
        </div>
        <Input
          placeholder="Search by room Number"
          className="w-full rounded-full px-20 h-12 bg-card"
          defaultValue={searchParams.get("query")?.toString() || ""}
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
        />
        <div className="absolute top-0 bottom-0 right-0">
          <Button
            type="button"
            aria-label="Search"
            title="Search"
            variant="default"
            rounded="full"
            size="lg"
          >
            <span className="relative text-base font-semibold">
              <Search className="w-5 h-5" />
            </span>
          </Button>
        </div>
      </div>
      <div
        className={cn(
          open ? "h-10" : "h-0",
          "transition-all delay-150 duration-300 overflow-hidden w-full flex gap-2 justify-start items-center"
        )}
      >
        <div>
          <h6 className="font-medium text-xs text-muted-foreground">
            Filter by
          </h6>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "available", "occupied"].map((status) => (
            <Button
              key={status}
              variant={current_status === status ? "default_light" : "outline"}
              size="sm"
              className={"capitalize"}
              onClick={() => {
                handleFilter("currentStatus", status);
              }}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
