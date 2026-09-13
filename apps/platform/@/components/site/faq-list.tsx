"use client";

import { cn } from "@/lib/utils";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Plus } from "lucide-react";

export type FaqItem = { q: string; a: string };

type FaqListProps = {
  items: FaqItem[];
  /** `cards`: numbered card per row. `rules`: hairline-divided rows. */
  variant?: "rules" | "cards";
};

/** Radix accordion so panels animate their measured height; one open at a time. */
export function FaqList({ items, variant = "rules" }: FaqListProps) {
  const cards = variant === "cards";

  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      defaultValue="0"
      className={cards ? "flex flex-col gap-3" : "border-t border-border"}
    >
      {items.map((item, i) => (
        <AccordionPrimitive.Item
          key={item.q}
          value={String(i)}
          className={
            cards
              ? "rounded-2xl border border-border bg-card px-6 dark:bg-background"
              : "border-b border-border"
          }
        >
          <AccordionPrimitive.Header asChild>
            <h3>
              <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-6 rounded-sm py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                <span className="flex items-center gap-4">
                  {cards && (
                    <span className="text-body font-semibold tabular-nums text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span
                    className={cn(
                      "font-medium text-foreground",
                      cards ? "text-body-lg" : "text-body"
                    )}
                  >
                    {item.q}
                  </span>
                </span>
                {cards ? (
                  <ChevronDown
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-craft group-data-[state=open]:rotate-180"
                  />
                ) : (
                  <Plus
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-craft group-hover:text-foreground group-data-[state=open]:rotate-45"
                  />
                )}
              </AccordionPrimitive.Trigger>
            </h3>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p
              className={cn(
                "max-w-2xl text-pretty pb-5 text-body leading-relaxed text-muted-foreground",
                cards && "pl-10"
              )}
            >
              {item.a}
            </p>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
