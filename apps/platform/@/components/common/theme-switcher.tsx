"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Paintbrush } from "lucide-react";
import * as React from "react";

import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type themeType } from "@/constants/theme";
import useStorage from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { sendGAEvent } from "@next/third-parties/google";
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



// Define brand themes
export interface brandThemeType {
  name: string
  color: string
}
export const brand_themes = [
  { name: "Nexo Purple", color: "#7F57F1" },
  { name: "Google Blue", color: "#4285F4" },
  { name: "Facebook Blue", color: "#1877F2" },
  { name: "Netflix Red", color: "#E50914" },
  { name: "Spotify Green", color: "#1DB954" },
  { name: "Amazon Orange", color: "#FF9900" },
  { name: "Apple Gray", color: "#333333" },
  { name: "Microsoft Teal", color: "#00A4EF" },
  { name: "LinkedIn Blue", color: "#0A66C2" },
  { name: "YouTube Red", color: "#FF0000" },
  { name: "Twitch Purple", color: "#9146FF" },
  { name: "Discord Blurple", color: "#5865F2" },
  { name: "Reddit Orange", color: "#FF4500" },
  { name: "Instagram Gradient", color: "#E1306C" }, // base pink from gradient
  { name: "Snapchat Yellow", color: "#FFFC00" },
  { name: "Tesla Red", color: "#CC0000" },
  { name: "Slack Plum", color: "#611F69" },
  { name: "PayPal Blue", color: "#003087" },
];



export function ThemePopover({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [currentTheme, setCurrentTheme] = useStorage<brandThemeType>("theme-brand", brand_themes[0]);

  // Apply theme color to :root CSS variables
  React.useEffect(() => {
    const selected = brand_themes.find((t) => t.name === currentTheme.name);
    if (selected) {
      const root = document.documentElement;
      root.style.setProperty("--primary", selected.color);
      root.style.setProperty("--ring", selected.color);
      // root.style.setProperty("--primary-foreground", "#ffffff");
      // Update <meta name="theme-color">
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
  }, [currentTheme]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="default_light" size="icon_sm" className={cn(className)}>
          <Paintbrush className="text-primary" />
          <span className="sr-only">Change Theme</span>
        </Button>
      </PopoverTrigger>

      <AnimatePresence>
        {open && (
          <PopoverContent
            align="end"
            className="min-w-56 p-0 w-auto max-w-fit"
            asChild
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="rounded-md border bg-popover shadow-md"
            >
              <p className="text-xs text-muted-foreground p-2">
                Select your favorite brand theme
              </p>
              <motion.div
                className="grid gap-2 p-2 grid-cols-2 sm:grid-cols-3"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: { transition: { staggerChildren: 0.02, staggerDirection: 1 } },
                  show: { transition: { staggerChildren: 0.04 } },
                }}
              >
                {brand_themes.map((theme) => (
                  <motion.button
                    key={theme.name}
                    onClick={() => {
                      setCurrentTheme(theme);
                      setOpen(false);
                      sendGAEvent("event", "brand_theme_switch", {
                        theme: theme.name,
                        color: theme.color,
                      });
                    }}
                    className={cn(
                      "flex items-center justify-start rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent w-full",
                      currentTheme.name === theme.name && "bg-accent"
                    )}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      show: { opacity: 1, x: 0 },
                    }}
                  >
                    <div className="flex items-center gap-2  whitespace-nowrap">
                      <span
                        className="size-4 aspect-square rounded-full border"
                        style={{ backgroundColor: theme.color }}
                      />
                      {theme.name}
                    </div>
                    {currentTheme.name === theme.name && <Check className="size-4" />}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  );
}