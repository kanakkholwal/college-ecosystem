
"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useStorage from "@/hooks/use-storage";
import { cn } from "@/lib/utils";
import { sendGAEvent } from "@next/third-parties/google";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import React from "react";



import { Icon, IconComponent } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type themeType } from "@/constants/theme";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes_modes = [
  {
    id: "system",
    Icon: IconComponent["monitor"],
    label: "System",
  },
  {
    id: "light",
    Icon: IconComponent["sun"],
    label: "Light",
  },
  {
    id: "dark",
    Icon: IconComponent["moon"],
    label: "Dark",
  },
] as const;

export type ThemeSwitcherProps = {
  onChange?: (theme: themeType) => void;

  className?: string;
};

export const ThemeSwitcher = ({ onChange, className }: ThemeSwitcherProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentBrandTheme] = useStorage<BrandThemeType>(
    "theme-brand",
    brand_themes[0]
  );
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    brandThemeCallback(currentBrandTheme);
  }, [currentBrandTheme]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon_sm" className={cn("rounded-full", className)} disabled>
        <Icon name="sun" className="size-4 opacity-50" />
      </Button>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon_sm" className={cn("relative rounded-full text-muted-foreground hover:text-foreground transition-colors", className)}>
            <Icon name="sun" className="size-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
            <Icon name="moon" className="absolute size-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[140px] p-1.5 border-border/50 bg-background/95 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col gap-1">
            {themes_modes.map((t) => {
              const isActive = theme === t.id;
              return (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    onChange?.(t.id as themeType);
                    sendGAEvent("event", "theme_mode_switch", {
                      label: t.label,
                    });
                  }}
                  className={cn(
                    "relative flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium outline-none transition-colors cursor-pointer focus:bg-transparent",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Animated Background Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="theme-switcher-active"
                      className="absolute inset-0 rounded-md bg-muted"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-2.5">
                    <t.Icon className={cn("size-3.5",isActive && "text-primary")}/>
                    <span>{t.label}</span>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};


export interface BrandThemeType {
  id: string;
  label: string;
  color: string;
}

export const brand_themes: BrandThemeType[] = [
  { id: "teal", label: "Teal", color: "#0d9488" },
  { id: "violet", label: "Violet", color: "#7c3aed" },
  { id: "indigo", label: "Indigo", color: "#4f46e5" },
  { id: "blue", label: "Ocean", color: "#2563eb" },
  { id: "sky", label: "Sky", color: "#0284c7" },
  { id: "emerald", label: "Emerald", color: "#059669" },
  { id: "amber", label: "Amber", color: "#d97706" },
  { id: "orange", label: "Tangerine", color: "#ea580c" },
  { id: "rose", label: "Rose", color: "#e11d48" },
  { id: "crimson", label: "Crimson", color: "#dc2626" },
  { id: "slate", label: "Graphite", color: "#475569" },
  { id: "zinc", label: "Carbon", color: "#27272a" },
];

function brandThemeCallback(currentTheme: BrandThemeType) {
    // Fallback to default if storage has invalid data
    const selected =
      brand_themes.find((t) => t.id === currentTheme.id) || brand_themes[0];

    const root = document.documentElement;

    // Inject Hex Color
    root.style.setProperty("--primary", selected.color);
    root.style.setProperty("--ring", selected.color);
    // Optional: If you use HSL in Tailwind (e.g. 262 80% 50%)
    // You might need a hexToHsl helper here if your tailwind.config uses <alpha-value>

    // Update Meta Theme Color for Mobile Browsers
    let themeMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.name = "theme-color";
      document.head.appendChild(themeMeta);
    }

    themeMeta.content = selected.color;
}

export function ThemePopover({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [currentTheme, setCurrentTheme] = useStorage<BrandThemeType>(
    "theme-brand",
    brand_themes[0]
  );

  // Apply CSS Variables
  React.useEffect(() => {
    // Fallback to default if storage has invalid data
    brandThemeCallback(currentTheme);
  }, [currentTheme]);

  return (
    <TooltipProvider delayDuration={0}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon_sm"
            className={cn(
              "relative size-9 rounded-full border border-border/40 bg-background transition-all hover:bg-muted group",
              className
            )}
          >
            {/* Active Color Indicator */}
            <span
              className="absolute inset-0 m-auto size-4 rounded-full transition-transform group-hover:scale-110"
              style={{ backgroundColor: currentTheme.color }}
            />
            <span className="sr-only">Change Theme</span>
          </Button>
        </PopoverTrigger>

        <AnimatePresence>
          {open && (
            <PopoverContent
              sideOffset={8}
              align="end"
              className="w-64 p-3 rounded-xl border border-border/50 backdrop-blur-xl shadow-xl"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Interface Color
                  </span>
                  <Palette className="size-3.5 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {brand_themes.map((theme) => {
                    const isActive = currentTheme.id === theme.id;

                    return (
                      <Tooltip key={theme.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              setCurrentTheme(theme);
                              // setOpen(false); // Optional: Keep open to let user preview
                              sendGAEvent("event", "brand_theme_switch", {
                                label: theme.label,
                                color: theme.color,
                              });
                            }}
                            className={cn(
                              "group relative flex items-center justify-center size-10 rounded-full border border-transparent transition-all hover:scale-105 focus:outline-hidden",
                              isActive
                                ? "border-foreground/20 shadow-xs"
                                : "hover:border-border"
                            )}
                            style={{
                              backgroundColor: isActive
                                ? "var(--accent)"
                                : "transparent",
                            }}
                          >
                            {/* Color Circle */}
                            <span
                              className={cn(
                                "size-6 rounded-full shadow-sm transition-all",
                                isActive && "scale-110"
                              )}
                              style={{ backgroundColor: theme.color }}
                            />

                            {/* Active Checkmark overlay */}
                            {isActive && (
                              <span className="absolute inset-0 flex items-center justify-center text-white mix-blend-plus-lighter">
                                <Check className="size-3.5 stroke-[3]" />
                              </span>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          className="text-xs font-medium"
                        >
                          {theme.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </motion.div>
            </PopoverContent>
          )}
        </AnimatePresence>
      </Popover>
    </TooltipProvider>
  );
}