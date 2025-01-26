"use client";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IoMdOptions } from "react-icons/io";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Suspense } from "react";

type Props = {
  branches: string[];
  batches: string[];
  programmes: string[];
};

export default function SearchBox({ branches, batches, programmes }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

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

    const params = new URLSearchParams(searchParams);
    if (key) {
      params.set(key, value);
      if (value === "none") params.delete(key);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative flex items-stretch w-full rounded-full">
      <div className="absolute top-0 bottom-0 left-0">
        <Suspense
          key={"filter_key"}
          fallback={
            <button
              type="button"
              className="relative flex h-12 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-linear-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-gray-700 dark:before:bg-gray-800 sm:w-max"
            >
              <span className="relative text-base font-semibold text-primary dark:text-white">
                <IoMdOptions className="w-5 h-5" />
              </span>
            </button>
          }
        >
          <ResponsiveDialog
            title="Filter Results"
            description="Filter by branches, batch,Programme"
            btnProps={{
              variant: "raw",
              size: "icon",
              children: (
                <span className="relative text-base font-semibold text-primary dark:text-white">
                  <IoMdOptions className="w-5 h-5" />
                </span>
              ),
              className:
                "overflow-hidden relative flex h-12 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-linear-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-gray-700 dark:before:bg-gray-800 sm:w-max",
            }}
          >
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-600 mb-2">
                By Branches
                {searchParams.get("branch")?.toString() && (
                  <Button
                    variant={"link"}
                    size="sm"
                    className={"text-xs h-8! capitalize"}
                    onClick={() => {
                      handleFilter("branch", "none");
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {["all", ...branches].map((branch) => (
                  <Button
                    key={branch}
                    variant={
                      searchParams.get("branch")?.toString() === branch
                        ? "default_light"
                        : "slate"
                    }
                    size="sm"
                    className="text-xs h-8! capitalize"
                    onClick={() => {
                      handleFilter("branch", branch);
                    }}
                  >
                    {branch}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-600 mb-2">
                By Batch
                {searchParams.get("batch")?.toString() && (
                  <Button
                    variant={"link"}
                    size="sm"
                    className={"text-xs h-8! capitalize"}
                    onClick={() => {
                      handleFilter("batch", "none");
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={
                    searchParams.get("batch")?.toString() === "all"
                      ? "default_light"
                      : "slate"
                  }
                  size="sm"
                  className={"text-xs h-8! capitalize"}
                  onClick={() => {
                    handleFilter("batch", "all");
                  }}
                >
                  All
                </Button>
                {batches.map((batch) => (
                  <Button
                    key={batch}
                    variant={
                      searchParams.get("batch")?.toString() === batch.toString()
                        ? "default_light"
                        : "slate"
                    }
                    size="sm"
                    className={"text-xs h-8! capitalize "}
                    onClick={() => {
                      handleFilter("batch", batch);
                    }}
                  >
                    {batch}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-600 mb-2">
                By Programme
                {searchParams.get("programme")?.toString() && (
                  <Button
                    variant={"link"}
                    size="sm"
                    className={"text-xs h-8! capitalize"}
                    onClick={() => {
                      handleFilter("programme", "none");
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={
                    searchParams.get("programme")?.toString() === "all"
                      ? "default_light"
                      : "slate"
                  }
                  size="sm"
                  className={"text-xs h-8! capitalize"}
                  onClick={() => {
                    handleFilter("programme", "all");
                  }}
                >
                  All
                </Button>
                {programmes.map((programme) => (
                  <Button
                    key={programme}
                    variant={
                      searchParams.get("programme")?.toString() === programme
                        ? "default_light"
                        : "slate"
                    }
                    size="sm"
                    className={"text-xs h-8! capitalize"}
                    onClick={() => {
                      handleFilter("programme", programme);
                    }}
                  >
                    {programme}
                  </Button>
                ))}
              </div>
            </div>
          </ResponsiveDialog>
        </Suspense>
      </div>
      <Suspense
        key={"search_key"}
        fallback={
          <Input
            placeholder="Search by Roll No. or Name "
            className="w-full rounded-full px-20 border border-border h-12 "
          />
        }
      >
        <Input
          placeholder="Search by Roll No. or Name "
          className="w-full rounded-full px-20 border border-border h-12 "
          defaultValue={searchParams.get("query")?.toString()}
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
        />
      </Suspense>
      <div className="absolute top-0 bottom-0 right-0">
        <button
          type="button"
          className="relative flex h-12 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
        >
          <span className="relative text-base font-semibold text-white">
            <Search className="w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  );
}
