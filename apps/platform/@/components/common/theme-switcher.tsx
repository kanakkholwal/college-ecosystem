
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
import useStorage from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { sendGAEvent } from "@next/third-parties/google";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import React from "react";



import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type themeType } from "@/constants/theme";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes_modes = [
  {
    key: "system",
    Icon: Monitor,
    label: "System",
  },
  {
    key: "light",
    Icon: Sun,
    label: "Light",
  },
  {
    key: "dark",
    Icon: Moon,
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

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  const CurrentTheme = themes_modes.find((t) => t.key === theme);

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon_sm" rounded="full">
            {CurrentTheme ? (
              <CurrentTheme.Icon className="size-4 absolute inset-0 m-auto" />
            ) : (
              <Monitor className="size-4" />
            )}
            <span className="sr-only">Open theme switcher</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          alignOffset={-8}
          className="max-w-24 space-y-1"
        >
          {themes_modes.map(({ key, Icon: Icon, label }) => {
            const isActive = theme === key;
            return (
              <Button
                variant="ghost"
                size="sm"
                width="full"
                key={key}
                onClick={() => {
                  setTheme(key as themeType);
                  onChange?.(key as themeType);
                }}
                className={cn("justify-start relative text-xs")}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTheme"
                    className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <Icon className="size-4 relative" />
                <span className="relative">{label}</span>
              </Button>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* {themes.map(({ key, Icon: Icon, label }) => {
        const isActive = theme === key;

        return (
          <button
            type="button"
            key={key}
            className="relative size-6 rounded-full"
            onClick={() => setTheme(key as themeType)}
            aria-label={label}
          >
            {isActive && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 rounded-full bg-secondary"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                "relative m-auto size-4",
                isActive ? "text-white" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })} */}
    </div>
  );
};


// --- 1. REFINED THEMES (Ecosystem/Professional Focused) ---
export interface BrandThemeType {
  id: string;
  label: string;
  color: string;
}

export const brand_themes: BrandThemeType[] = [
  { id: "violet", label: "Violet (Default)", color: "#7c3aed" }, // Violet-600
  { id: "indigo", label: "Indigo", color: "#4f46e5" }, // Indigo-600
  { id: "blue", label: "Ocean", color: "#2563eb" }, // Blue-600
  { id: "sky", label: "Sky", color: "#0284c7" }, // Sky-600
  { id: "teal", label: "Teal", color: "#0d9488" }, // Teal-600
  { id: "emerald", label: "Emerald", color: "#059669" }, // Emerald-600
  { id: "amber", label: "Amber", color: "#d97706" }, // Amber-600
  { id: "orange", label: "Tangerine", color: "#ea580c" }, // Orange-600
  { id: "rose", label: "Rose", color: "#e11d48" }, // Rose-600
  { id: "crimson", label: "Crimson", color: "#dc2626" }, // Red-600
  { id: "slate", label: "Graphite", color: "#475569" }, // Slate-600
  { id: "zinc", label: "Carbon", color: "#27272a" }, // Zinc-800
];

// --- 2. REDESIGNED COMPONENT ---

export function ThemePopover({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [currentTheme, setCurrentTheme] = useStorage<BrandThemeType>(
    "theme-brand",
    brand_themes[0]
  );

  // Apply CSS Variables
  React.useEffect(() => {
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