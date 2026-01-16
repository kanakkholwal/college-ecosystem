"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

interface Tab {
  id: string;
  label: string | React.ReactNode;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[];
  activeTab?: string;
  triggerClassName?: string;
  triggerHeight?: string;
  tabsListClassName?: string;
  onTabChange?: (tabId: string) => void;
  onTabChangeQuery?: string;
}

const VercelTabsList = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      tabs,
      activeTab,
      onTabChange,
      onTabChangeQuery,
      triggerHeight = "h-[30px]",
      tabsListClassName,
      ...props
    },
    ref
  ) => {
    const [tabsState, setTabsState] = useQueryState(onTabChangeQuery || "tab", {
      defaultValue: activeTab || tabs[0]?.id,
    });
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoverStyle, setHoverStyle] = useState({});
    const [activeStyle, setActiveStyle] = useState({
      left: "0px",
      width: "0px",
    });
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
      if (hoveredIndex !== null) {
        const hoveredElement = tabRefs.current[hoveredIndex];
        if (hoveredElement) {
          const { offsetLeft, offsetWidth } = hoveredElement;
          setHoverStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          });
        }
      }
    }, [hoveredIndex]);

    useEffect(() => {
      const activeElement = tabRefs.current[activeIndex];
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }, [activeIndex]);

    useEffect(() => {
      requestAnimationFrame(() => {
        const firstElement = tabRefs.current[0];
        if (firstElement) {
          const { offsetLeft, offsetWidth } = firstElement;
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          });
        }
      });
    }, []);

    return (
      <div
        className={cn(
          "mx-auto flex-1 lg:max-w-(--max-app-width)",
          "snap-x snap-mandatory overflow-x-auto scrollbar-0 scrollbar-thumb-muted/0 scrollbar-track-transparent no-scrollbar",
          className,
          "relative"
        )}
        ref={ref}
        {...props}
      >
        <div
          className={cn(
            "absolute transition-all duration-300 ease-out bg-card rounded-xl flex items-center",
            triggerHeight
          )}
          style={{
            ...hoverStyle,
            opacity: hoveredIndex !== null ? 1 : 0,
          }}
        />
        {/* Active Indicator */}
        <div
          className="absolute top-auto z-10 bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out"
          style={activeStyle}
        />
        <TabsList className={cn("inline-flex space-x-[6px] items-center border",tabsListClassName)}>
          {tabs.map((tab, index) => (
            <TabsTrigger
              value={tab.id}
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              className={cn(
                "px-3 py-2 cursor-pointer transition-colors duration-300",
                activeIndex === index
                  ? "data-[state=active]:text-primary"
                  : " data-[state=active]:text-muted-foreground  data-[state=active]:hover:text-foreground/80",
                "data-[state=active]:bg-transparent  data-[state=active]:shadow-none",
                props?.triggerClassName,
                triggerHeight
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                setActiveIndex(index);
                if (onTabChangeQuery) {
                  setTabsState(tab.id);
                }
                onTabChange?.(tab.id);
              }}
            >
              <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full gap-2 z-10">
                {tab.icon && <tab.icon className="size-4 text-[inherit]" />}
                {tab.label}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    );
  }
);
VercelTabsList.displayName = "VercelTabs";

export { Tabs, TabsContent, TabsList, TabsTrigger, VercelTabsList };

