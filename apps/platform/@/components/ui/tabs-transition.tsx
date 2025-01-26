"use client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TransitionPanel } from "@/components/ui/transition-panel";
import { cn } from "@/lib/utils";
import type React from "react";
import { useState } from "react";

interface TransitionPanelProps {
  items: {
    title: string | React.ReactNode;
    content: React.ReactNode;
    id: string;
  }[];
  defaultActiveIndex?: number;
  className?: string;
  classNames?: {
    tabList?: string;
    tabTrigger?: string;
    tabContentList?: string;
    tabContent?: string;
  };
}

export function TabsTransitionPanel({
  items,
  className,
  defaultActiveIndex,
  classNames,
}: TransitionPanelProps) {
  const [activeIndex, setActiveIndex] = useState<number>(
    defaultActiveIndex || 0
  );
  return (
    <div className={cn("space-y-4", className)}>
      <ToggleGroup
        defaultValue={"0"}
        onValueChange={(value) =>
          setActiveIndex(items.findIndex((item) => item.id === value))
        }
        type="single"
        className={cn(
          "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground flex-wrap",
          classNames?.tabList
        )}
      >
        {items.map((item, index) => (
          <ToggleGroupItem
            value={item.id}
            key={item.id}
            data-state={activeIndex === index ? "on" : "off"}
            className={cn(
              "border-transparent text-inherit bg-transparent",
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background/40 data-[state=active]:text-gray-800 data-[state=active]:shadow-xs",
              classNames?.tabTrigger
            )}
          >
            {item.title}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div
        className={cn(
          "overflow-hidden border-t border-zinc-200 dark:border-zinc-700",
          classNames?.tabContentList
        )}
      >
        <TransitionPanel
          activeIndex={activeIndex}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          variants={{
            enter: { opacity: 0, y: -50, filter: "blur(4px)" },
            center: { opacity: 1, y: 0, filter: "blur(0px)" },
            exit: { opacity: 0, y: 50, filter: "blur(4px)" },
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                classNames?.tabContent
              )}
            >
              {item.content}
            </div>
          ))}
        </TransitionPanel>
      </div>
    </div>
  );
}
