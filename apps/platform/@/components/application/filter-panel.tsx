"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Check, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export type FilterOption = {
  key: string;
  label: string;
  values: { value: string; label: string }[];
};

type FilterPanelProps = {
  title: string;
  description: string;
  options: FilterOption[];
  getValue: (key: string) => string | null;
  onSelect: (key: string, value: string) => void;
  onClearAll: () => void;
  activeCount: number;
};

/** Long or wordy option sets read better as a radio list than as wrapping chips. */
const asList = (option: FilterOption) =>
  option.values.length > 8 || option.values.some((v) => v.label.length > 18);

export function FilterPanel({
  title,
  description,
  options,
  getValue,
  onSelect,
  onClearAll,
  activeCount,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={
        activeCount > 0 ? `Filters, ${activeCount} applied` : "Filters"
      }
      onClick={() => setOpen(true)}
      className={cn(
        "relative size-10 rounded-xl text-muted-foreground hover:bg-background hover:text-foreground",
        activeCount > 0 && "text-primary"
      )}
    >
      <SlidersHorizontal className="size-4" />
      {activeCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-primary text-caption font-semibold leading-none text-primary-foreground tabular-nums"
        >
          {activeCount}
        </span>
      )}
    </Button>
  );

  const body = (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div className="min-w-0">
          {isDesktop ? (
            <>
              <SheetTitle className="text-subheading font-medium">
                {title}
              </SheetTitle>
              <SheetDescription className="text-body">
                {description}
              </SheetDescription>
            </>
          ) : (
            <>
              <DrawerTitle className="text-subheading font-medium">
                {title}
              </DrawerTitle>
              <DrawerDescription className="text-body">
                {description}
              </DrawerDescription>
            </>
          )}
        </div>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-7">
          {options.map((option) => (
            <FilterGroup
              key={option.key}
              option={option}
              selected={getValue(option.key)}
              onSelect={(value) => onSelect(option.key, value)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          type="button"
          variant="ghost"
          disabled={activeCount === 0}
          onClick={onClearAll}
        >
          Clear all
        </Button>
        <Button type="button" variant="primary" onClick={() => setOpen(false)}>
          Show results
        </Button>
      </div>
    </>
  );

  return (
    <>
      {trigger}
      {isDesktop ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
          >
            {body}
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="flex max-h-[85svh] flex-col">
            {body}
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

function FilterGroup({
  option,
  selected,
  onSelect,
}: {
  option: FilterOption;
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  const list = asList(option);
  const current = selected ?? "all";
  const labelId = `filter-${option.key}`;

  return (
    <fieldset className="flex min-w-0 flex-col gap-3 border-0 p-0">
      <legend className="mb-3 flex w-full items-baseline justify-between gap-3">
        <span className="text-body font-medium text-foreground">
          {option.label.replace(/^By\s+/i, "")}
        </span>
        {selected && (
          <button
            type="button"
            onClick={() => onSelect("all")}
            className="rounded-sm text-caption font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reset
          </button>
        )}
      </legend>

      <div
        className={
          list
            ? "flex flex-col gap-0.5 rounded-xl border border-border p-1"
            : "flex flex-wrap gap-2"
        }
      >
        {option.values.map((item) => {
          const checked = current === item.value;
          return (
            <label
              key={item.value}
              className={cn(
                "cursor-pointer transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-inset has-focus-visible:ring-ring",
                list
                  ? "flex h-10 w-full items-center justify-between gap-3 rounded-lg px-3 text-body"
                  : "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-body",
                list &&
                  (checked
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"),
                !list &&
                  (checked
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted dark:bg-background")
              )}
            >
              <input
                type="radio"
                name={labelId}
                value={item.value}
                checked={checked}
                onChange={() => onSelect(item.value)}
                className="sr-only"
              />
              <span className="min-w-0 truncate">{item.label}</span>
              {checked && (
                <Check
                  aria-hidden="true"
                  className={cn("size-4 shrink-0", list && "text-primary")}
                />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
