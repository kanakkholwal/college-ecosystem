"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

// --- Types ---
type FilterOption = {
  key: string;
  label: string;
  values: { value: string; label: string }[];
};

type SearchBoxProps = {
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  searchParamsKey?: string;
  debounceTime?: number;
  filterDialogTitle?: string;
  filterDialogDescription?: string;
  variant?: "default" | "expanded"; // Expanded shows chips below, Default uses Dialog
  className?: string;
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
  disabled = false,
  id = "search-input",
}: SearchBoxProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [showExpandedFilters, setShowExpandedFilters] = useState(false);

  // Memoize URL Params
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);

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

  const handleFilter = useCallback((key: string, value: string) => {
    // If selecting the currently selected value, clear it (toggle behavior)
    // OR if value is explicit "all"/"none"
    if (params.get(key) === value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1"); // Reset pagination on filter
    replace(`${pathname}?${params.toString()}`);
  }, [params, pathname, replace]);

  const clearAllFilters = useCallback(() => {
    filterOptions.forEach((opt) => params.delete(opt.key));
    replace(`${pathname}?${params.toString()}`);
  }, [filterOptions, params, pathname, replace]);

  // Check if any filters are active
  const activeFilterCount = filterOptions.reduce(
    (acc, opt) => (params.has(opt.key) ? acc + 1 : acc),
    0
  );

  return (
    <div className={cn("w-full space-y-3", className)}>

      {/* --- Main Input Bar --- */}
      <div className="relative group">
        {/* Background Glow (Optional aesthetic touch) */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/0 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500" />

        <div className="relative flex items-center bg-card rounded-full shadow-sm border border-border/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">

          {/* Left: Filter Trigger */}
          {filterOptions.length > 0 && (
            <div className="pl-1.5">
              {variant === "default" ? (
                <Suspense fallback={<FilterButtonFallback />}>
                  <ResponsiveDialog
                    title={filterDialogTitle}
                    description={filterDialogDescription}
                    btnProps={{
                      variant: "ghost",
                      size: "icon",
                      className: cn(
                        "size-9 rounded-full text-muted-foreground hover:bg-muted transition-colors",
                        activeFilterCount > 0 && "text-primary bg-primary/10 hover:bg-primary/20"
                      ),
                      children: <SlidersHorizontal className="size-4" />,
                    }}
                  >
                    <FilterContent
                      options={filterOptions}
                      currentParams={params}
                      onSelect={handleFilter}
                    />
                  </ResponsiveDialog>
                </Suspense>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-9 rounded-full text-muted-foreground hover:bg-muted transition-colors",
                    showExpandedFilters && "bg-muted text-foreground"
                  )}
                  onClick={() => setShowExpandedFilters(!showExpandedFilters)}
                >
                  <SlidersHorizontal className="size-4" />
                </Button>
              )}
            </div>
          )}

          {/* Center: Input */}
          <Input
            id={id}
            className="flex-1 h-12 border-none bg-transparent dark:bg-transparent focus:bg-transparent  focus-visible:bg-transparent shadow-none px-3 focus-visible:ring-0 placeholder:text-muted-foreground/60"
            placeholder={searchPlaceholder}
            defaultValue={searchParams.get(searchParamsKey)?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={disabled}
          />

          {/* Right: Search Action */}
          <div className="pr-1.5">
            <Button
              size="icon"
              className="size-9 rounded-full shrink-0"
              onClick={() => {
                const input = document.getElementById(id) as HTMLInputElement;
                if (input) handleSearch(input.value);
              }}
              disabled={disabled}
            >
              <Search className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* --- Variant: Expanded Filters (Tag Cloud) --- */}
      {variant === "expanded" && showExpandedFilters && filterOptions.length > 0 && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Filters
            </span>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 text-[10px] text-muted-foreground hover:text-destructive px-2"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <div key={option.key} className="flex items-center gap-2 p-1 pr-2 rounded-full border border-border/60 bg-card/50">
                <span className="pl-2 text-[10px] font-medium text-muted-foreground/70 uppercase">
                  {option.label}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex gap-1">
                  {option.values.map((val) => {
                    const isActive = params.get(option.key) === val.value;
                    return (
                      <button
                        key={val.value}
                        onClick={() => handleFilter(option.key, val.value)}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs transition-all border border-transparent",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
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

// --- Sub-components ---

function FilterButtonFallback() {
  return (
    <Button variant="ghost" size="icon" className="size-9 rounded-full" disabled>
      <SlidersHorizontal className="size-4 opacity-50" />
    </Button>
  );
}

function FilterContent({
  options,
  currentParams,
  onSelect,
}: {
  options: FilterOption[];
  currentParams: URLSearchParams;
  onSelect: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-6 py-2">
      {options.map((group) => {
        // Check if this specific group has an active filter
        const activeValue = currentParams.get(group.key);
        const hasSelection = !!activeValue;

        return (
          <div key={group.key} className="space-y-3">
            {/* Group Header with optional Reset */}
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </h4>
              {hasSelection && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onSelect(group.key, "all")} // Assuming 'all' clears it
                >
                  <RotateCcw className="mr-1.5 size-3" />
                  Reset
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.values.map((item) => {
                const isSelected = currentParams.get(group.key) === item.value.toString();
                return (
                  <Button
                    key={item.value}
                    onClick={() => onSelect(group.key, item.value)}
                    size="xs"
                    variant={isSelected ? "default_soft":"outline"}
                  >
                    {item.label}
                    {isSelected && <Check className="ml-1 size-3" />}
                  </Button>
                );
              })}
            </div>
          </div>)
      })}
      {options.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-4">
          No filters available.
        </div>
      )}
    </div>
  );
}