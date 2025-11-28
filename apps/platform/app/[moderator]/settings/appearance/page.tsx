"use client";

import { brand_themes, brandThemeType } from "@/components/common/theme-switcher";
import { Separator } from "@/components/ui/separator";
import useStorage from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { Check, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

// --- Components ---

export default function AppearanceForm() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-96" />; // Prevent hydration mismatch

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the interface theme and brand colors.
        </p>
      </div>
      <Separator />
      
      <div className="space-y-8">
        <ThemeModeSelector />
        <BrandThemeSelector />
      </div>
    </div>
  );
}

/* ----------------------- Theme Mode Selector ----------------------- */

const ThemeModeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Interface Theme</h4>
        <p className="text-xs text-muted-foreground">
          Select your preferred background mode.
        </p>
      </div>
       <div className="grid grid-cols-3 gap-4">
        <ThemeCard
          label="Light"
          active={theme === "light"}
          onClick={() => setTheme("light")}
        >
          <div className="space-y-2 rounded-md bg-[#f4f4f5] p-2">
            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
              <div className="h-2 w-[80px] rounded-lg bg-[#e4e4e7]" />
              <div className="h-2 w-[100px] rounded-lg bg-[#e4e4e7]" />
            </div>
            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
              <div className="h-4 w-4 rounded-full bg-[#e4e4e7]" />
              <div className="h-2 w-[100px] rounded-lg bg-[#e4e4e7]" />
            </div>
          </div>
        </ThemeCard>

        <ThemeCard
          label="Dark"
          active={theme === "dark"}
          onClick={() => setTheme("dark")}
        >
          <div className="space-y-2 rounded-md bg-slate-950 p-2">
            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
              <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
            </div>
            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
              <div className="h-4 w-4 rounded-full bg-slate-400" />
              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
            </div>
          </div>
        </ThemeCard>

        <ThemeCard
          label="System"
          active={theme === "system"}
          onClick={() => setTheme("system")}
        >
          <div className="flex h-full items-center justify-center rounded-md bg-accent/50 p-2">
            <div className="flex flex-col items-center justify-center gap-2">
              <Laptop className="h-8 w-8 text-muted-foreground/60" />
            </div>
          </div>
        </ThemeCard>
      </div>
    </div>
  );
};

function ThemeCard({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-2 text-left focus:outline-none",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-2 bg-background p-1 transition-all duration-200",
          active ? "border-primary" : "border-muted hover:border-muted-foreground/50"
        )}
      >
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg">
            {children}
        </div>
        
        {/* Active Badge */}
        {active && (
            <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground shadow-sm">
                <Check className="h-3 w-3" />
            </div>
        )}
      </div>
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
        {label}
      </span>
    </button>
  );
}

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
    <div className="space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Accent Color</h4>
        <p className="text-xs text-muted-foreground">
          Choose the primary color for buttons and highlights.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {brand_themes.map((brandTheme) => {
          const isActive = currentTheme.name === brandTheme.name;
          
          return (
            <button
              key={brandTheme.color}
              onClick={() => setCurrentTheme(brandTheme)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all hover:bg-accent",
                isActive ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
              )}
            >
              <div 
                className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border shadow-sm"
                style={{ backgroundColor: brandTheme.color }}
              >
                  {isActive && <Check className="size-3 text-white " />}
              </div>
              
              <div className="flex-1 truncate text-xs font-medium">
                {brandTheme.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};