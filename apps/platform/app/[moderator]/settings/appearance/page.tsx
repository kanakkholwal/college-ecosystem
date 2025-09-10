"use client";

import { DarkTheme, LightTheme, SystemTheme } from "@/components/common/theme";
import { brand_themes, brandThemeType } from "@/components/common/theme-switcher";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useStorage from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import * as React from "react";

/* ----------------------- Brand Theme Selector ----------------------- */
const BrandThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useStorage<brandThemeType>(
    "theme-brand",
    brand_themes[0]
  );

  React.useEffect(() => {
    const selected = brand_themes.find((t) => t.name === currentTheme.name);
    if (selected) {
      const root = document.documentElement;
      root.style.setProperty("--primary", selected.color);
      root.style.setProperty("--ring", selected.color);
    }
  }, [currentTheme]);

  return (
    <div className="relative w-full flex-col rounded-lg border bg-card">
      <div className="px-3 pt-3 font-medium text-base">Application Brand Theme</div>
      <p className="text-sm text-muted-foreground mt-0.5 px-3">
        Pick a brand color to style your application
      </p>
      <div className="my-3 h-px w-full bg-border" />

      <RadioGroup
        value={currentTheme.color}
        onValueChange={(color) => {
          const selected = brand_themes.find((b) => b.color === color);
          if (selected) setCurrentTheme(selected);
        }}
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 p-6"
      >
        {brand_themes.map((brandTheme) => {
          const isActive = currentTheme.name === brandTheme.name;
          return (
            <motion.div
              key={brandTheme.color}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative cursor-pointer rounded-xl border bg-card p-4 flex flex-col items-center justify-center transition",
                isActive ? "border-primary shadow-lg" : "border-border"
              )}
            >
              <RadioGroupItem
                value={brandTheme.color}
                id={brandTheme.color}
                className="sr-only"
              />
              <label htmlFor={brandTheme.color} className="cursor-pointer w-full h-full flex items-center gap-3">
                <motion.div
                  layoutId="brandThemeDot"
                  className="size-8 rounded-full border shadow-md "
                  style={{ backgroundColor: brandTheme.color }}
                />
                <div className="text-left font-medium">
                  <p className="text-sm">
                    {brandTheme.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {brandTheme.color}
                  </p>

                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="brandThemeActive"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 rounded-xl ring-2 ring-primary pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </label>

            </motion.div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

/* ----------------------- Theme Mode Selector ----------------------- */
type ThemeType = "light" | "dark" | "system";

interface ThemeOption {
  value: ThemeType;
  label: string;
  icon: React.ComponentType;
}

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light", icon: LightTheme },
  { value: "dark", label: "Dark", icon: DarkTheme },
  { value: "system", label: "System", icon: SystemTheme },
];

const ThemeModeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [systemTheme, setSystemTheme] = React.useState<"dark" | "light">("light");

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(media.matches ? "dark" : "light");
    const listener = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return (
    <div className="relative w-full flex-col rounded-lg border bg-card mt-6">
      <div className="px-3 pt-3 font-medium text-base">Application Theme Mode</div>
      <p className="text-sm text-muted-foreground mt-0.5 px-3">
        Choose how the UI should look
      </p>
      <div className="my-3 h-px w-full bg-border" />

      <RadioGroup
        value={theme}
        onValueChange={(val: ThemeType) => setTheme(val)}
        className="grid gap-4 grid-cols-3 p-6"
      >
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = theme === option.value;
          const isSystem = option.value === "system";
          const mode = isSystem ? systemTheme : option.value;

          return (
            <motion.div
              key={option.value}
              className={cn(
                "relative cursor-pointer rounded-xl border bg-card p-4 flex flex-col items-center justify-center transition",
                isSelected ? "shadow-lg" : ""
              )}
            >
              <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
              <label htmlFor={option.value} className="cursor-pointer w-full h-full flex flex-col items-center">
                <motion.div layoutId={`themeIcon-${option.value}`} className="text-xl">
                  <Icon />
                </motion.div>
                <span className="absolute inset-x-0 bottom-2 flex justify-center sm:-bottom-1">
                  <span className="relative">
                    <span className="relative inline-flex h-[30px] bg-primary/20 transform-gpu touch-none select-none items-center justify-center gap-2 rounded-md border-none border-transparent bg-button px-3 text-[13px] font-semibold leading-none text-primary shadow-button after:absolute after:-inset-[1px] after:block after:rounded-md after:bg-gradient-to-t after:from-black/5 after:opacity-50 after:transition-opacity hover:after:opacity-100 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:after:from-black/[0.15] dark:focus-visible:ring-blue-600">
                      {option.label}
                    </span>
                  </span>
                </span>
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      layoutId="activeTheme"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-x-1.5 -bottom-3 h-0.5 rounded-full bg-primary max-sm:hidden max-w-3/5 mx-auto"
                    />

                  )}
                </AnimatePresence>
              </label>
            </motion.div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

/* ----------------------- Combined Export ----------------------- */
export default function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      <ThemeModeSelector />
      <BrandThemeSelector />
    </>
  );
}
