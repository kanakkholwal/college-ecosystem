"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { IoMdOptions } from "react-icons/io";
import { useDebouncedCallback } from "use-debounce";

type FilterOption = {
  key: string;
  label: string;
  values: { value: string; label: string }[];
};

type SearchBoxProps = {
  searchPlaceholder: string;
  filterOptions?: FilterOption[];
  searchParamsKey?: string;
  debounceTime?: number;
  filterDialogTitle?: string;
  filterDialogDescription?: string;
  variant?: "default" | "expanded";
  className?: string;
  disabled?: boolean;
  id?: string;
};

export default function BaseSearchBox({
  searchPlaceholder = "Search...",
  filterOptions = [],
  searchParamsKey = "query",
  debounceTime = 300,
  filterDialogTitle = "Filter",
  filterDialogDescription = "Filter by different options",
  variant = "default",
  className,
  disabled = false,
  id
}: SearchBoxProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [open, setOpen] = useState(false);
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);

  const handleSearch = useDebouncedCallback((term: string) => {
    params.set("page", "1");

    if (term) {
      params.set(searchParamsKey, term);
    } else {
      params.delete(searchParamsKey);
    }
    replace(`${pathname}?${params.toString()}`);
  }, debounceTime);

  const handleFilter = (key: string, value: string) => {
    if (value === "none" || value === "all") {
      params.delete(key);
    } else if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    replace(`${pathname}?${params.toString()}`);
  };



  return (
    <div
      className={cn(
        "w-full pr-2",
        variant === "expanded"
          ? "grid gap-4"
          : "relative flex items-stretch rounded-full",
        className
      )}
      aria-disabled={disabled}
      data-disabled={disabled ? "true" : "false"}
    >
      <div
        className={cn(
          "relative flex items-stretch w-full rounded-full",
          variant === "expanded" ? "h-auto" : ""
        )}
      >
        {filterOptions.length > 0 && (
          <div className="absolute top-1 bottom-1 left-1">
            {variant === "default" ? (
              <Suspense
                fallback={
                  <Button
                    type="button"
                    aria-label="Filter Options"
                    title="Filter"
                    variant="glass"
                    rounded="full"
                    size={isDesktop ? "default" : "icon_sm"}
                    disabled={disabled}
                  >
                    <IoMdOptions />
                  </Button>
                }
              >
                <ResponsiveDialog
                  title={filterDialogTitle}
                  description={filterDialogDescription}
                  btnProps={{
                    variant: "default_light",
                    rounded: "full",
                    size: isDesktop ? "default" : "icon_sm",
                    "aria-label": "Filter Options",
                    title: "Filter",
                    children: <IoMdOptions />,
                    disabled: disabled,
                  }}
                >
                  {filterOptions.map((option) => (
                    <div key={option.key} className="mb-4">
                      <p className="text-muted-foreground mb-2">
                        <span className="font-medium text-xs">
                          {option.label}
                        </span>
                        {searchParams.get(option.key) && (
                          <Button
                            variant="link"
                            size="xs"
                            className="capitalize ml-2"
                            onClick={() => handleFilter(option.key, "none")}
                          >
                            Clear
                          </Button>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map(({ value, label }) => (
                          <Button
                            key={value}
                            variant={
                              searchParams.get(option.key) === value
                                ? "default_light"
                                : "outline"
                            }
                            size="xs"
                            className="capitalize"
                            onClick={() => handleFilter(option.key, value)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </ResponsiveDialog>
              </Suspense>
            ) : (
              <Button
                type="button"
                aria-label="Filter"
                title="Filter"
                onClick={() => setOpen(!open)}
                variant="light"
                rounded="full"
                size={isDesktop ? "default" : "icon_sm"}
                disabled={disabled}
              >
                <IoMdOptions />
              </Button>
            )}
          </div>
        )}

        <Input
          className={cn(
            "w-full rounded-full",
            isDesktop ? "h-11 px-18" : "h-10 pl-10 pr-14"
          )}
          placeholder={searchPlaceholder}
          defaultValue={searchParams.get(searchParamsKey)?.toString()}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch(e.currentTarget.value);
          }}
          id={`search-${id ?? "input"}`}
          onBlur={(e) => handleSearch(e.currentTarget.value)}
          disabled={disabled}
        />

        <div className="absolute top-1 bottom-1 right-1">
          <Button
            type="button"
            aria-label="Search"
            title="Search"
            variant="light"
            rounded="full"
            className="justify-center"
            transition="damped"
            size={isDesktop ? "default" : "sm"}
            disabled={disabled}
            onClick={() => {
              const input = document.getElementById(`search-${id ?? "input"}`) as HTMLInputElement;
              if (input) {
                handleSearch(input.value)
                input.blur()
              }
            }
            }
          >
            <Search className="mx-auto" />
          </Button>
        </div>
      </div>

      {variant === "expanded" && filterOptions.length > 0 && (
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
            {filterOptions.flatMap((option) =>
              option.values.map(({ value, label }) => (
                <Button
                  key={`${option.key}-${value}`}
                  variant={
                    searchParams.get(option.key) === value
                      ? "default_light"
                      : "outline"
                  }
                  size="xs"
                  className="capitalize"
                  onClick={() => handleFilter(option.key, value)}
                >
                  {label}
                </Button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
