"use client";

import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FilterPanel, type FilterOption } from "./filter-panel";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

type SearchBoxProps = {
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  searchParamsKey?: string;
  debounceTime?: number;
  filterDialogTitle?: string;
  filterDialogDescription?: string;
  variant?: "default" | "expanded"; // Expanded shows chips below, Default uses Dialog
  className?: string;
  searchBoxClassName?: string;
  disabled?: boolean;
  id?: string;
};

export default function BaseSearchBox({
  searchPlaceholder = "Search ecosystem...",
  filterOptions = [],
  searchParamsKey = "query",
  debounceTime = 300,
  filterDialogTitle = "Filter Results",
  filterDialogDescription = "Refine your search with specific criteria.",
  variant = "default",
  className,
  searchBoxClassName,
  disabled = false,
  id = "search-input",
}: SearchBoxProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [showExpandedFilters, setShowExpandedFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlQuery = searchParams.get(searchParamsKey) ?? "";

  // Syncs external changes like "Clear search"; keying the input would drop focus on every debounced search.
  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement !== input && input.value !== urlQuery) {
      input.value = urlQuery;
    }
  }, [urlQuery]);

  // Memoize URL Params
  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams]
  );

  // --- Handlers ---

  const handleSearch = useDebouncedCallback((term: string) => {
    params.set("page", "1"); // Reset pagination on search
    if (term) {
      params.set(searchParamsKey, term);
    } else {
      params.delete(searchParamsKey);
    }
    replace(`${pathname}?${params.toString()}`);
  }, debounceTime);

  const handleFilter = useCallback(
    (key: string, value: string) => {
      // If selecting the currently selected value, clear it (toggle behavior)
      // OR if value is explicit "all"/"none"
      if (params.get(key) === value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.set("page", "1"); // Reset pagination on filter
      replace(`${pathname}?${params.toString()}`);
    },
    [params, pathname, replace]
  );

  const clearAllFilters = useCallback(() => {
    for (const opt of filterOptions) params.delete(opt.key);
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  }, [filterOptions, params, pathname, replace]);

  // Check if any filters are active
  const activeFilterCount = filterOptions.reduce(
    (acc, opt) => (params.has(opt.key) ? acc + 1 : acc),
    0
  );

  return (
    <div
      className={cn("w-full space-y-3 max-w-(--max-app-width) z-10", className)}
    >
      <div className="relative group">
        <div
          className={cn(
            "relative mx-auto flex h-14 items-center gap-1 rounded-2xl border border-border bg-card px-1.5 transition-colors focus-within:border-ring dark:bg-background",
            searchBoxClassName
          )}
        >
          {filterOptions.length > 0 && (
            <div className="pl-1.5">
              {variant === "default" ? (
                <FilterPanel
                  title={filterDialogTitle}
                  description={filterDialogDescription}
                  options={filterOptions}
                  getValue={(key) => params.get(key)}
                  onSelect={handleFilter}
                  onClearAll={clearAllFilters}
                  activeCount={activeFilterCount}
                />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-10 rounded-xl text-muted-foreground transition-colors hover:bg-muted",
                    showExpandedFilters && "bg-muted text-foreground"
                  )}
                  aria-label="Filters"
                  aria-expanded={showExpandedFilters}
                  onClick={() => setShowExpandedFilters(!showExpandedFilters)}
                >
                  <Icon name="sliders-horizontal" className="size-4" />
                </Button>
              )}
            </div>
          )}

          {/* Center: Input */}
          <Input
            id={id}
            ref={inputRef}
            className="h-12 flex-1 border-none bg-transparent px-3 text-base shadow-none focus:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 md:text-body-lg dark:bg-transparent"
            placeholder={searchPlaceholder}
            defaultValue={urlQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={disabled}
          />

          {/* Right: Search Action */}
          <div className="pr-1.5">
            <Button
              className="h-10 shrink-0 rounded-xl"
              onClick={() => {
                const input = document.getElementById(id) as HTMLInputElement;
                if (input) handleSearch(input.value);
              }}
              disabled={disabled}
              icon="search"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {variant === "expanded" &&
        showExpandedFilters &&
        filterOptions.length > 0 && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-caption font-semibold text-muted-foreground">
                Filters
              </span>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 px-2 text-caption text-muted-foreground hover:text-destructive"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card p-1 pr-2"
                >
                  <span className="pl-2 text-caption font-medium text-muted-foreground">
                    {option.label}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex gap-1">
                    {option.values.map((val) => {
                      const isActive = params.get(option.key) === val.value;
                      return (
                        <button
                          type="button"
                          aria-pressed={isActive}
                          key={val.value}
                          onClick={() => handleFilter(option.key, val.value)}
                          className={cn(
                            "h-7 rounded-lg border border-transparent px-2 text-caption transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {val.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
