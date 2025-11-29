"use client";

import { Separator } from "@/components/ui/separator";
import useStorage from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

// --- Data: Elemental Brand Themes ---
export interface BrandThemeType {
  id: string;
  label: string;
  color: string;
}

export const brand_themes: BrandThemeType[] = [
  { id: "violet", label: "Violet", color: "#7c3aed" },
  { id: "indigo", label: "Indigo", color: "#4f46e5" },
  { id: "blue", label: "Ocean", color: "#2563eb" },
  { id: "sky", label: "Sky", color: "#0284c7" },
  { id: "teal", label: "Teal", color: "#0d9488" },
  { id: "emerald", label: "Emerald", color: "#059669" },
  { id: "amber", label: "Amber", color: "#d97706" },
  { id: "orange", label: "Tangerine", color: "#ea580c" },
  { id: "rose", label: "Rose", color: "#e11d48" },
  { id: "crimson", label: "Crimson", color: "#dc2626" },
  { id: "slate", label: "Graphite", color: "#475569" },
  { id: "zinc", label: "Carbon", color: "#27272a" },
];

// --- Main Component ---

export default function AppearanceForm() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-96 w-full animate-pulse rounded-xl bg-muted/20" />;

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how the application looks and feels on your device.
        </p>
      </div>
      
      <Separator className="my-6" />
      
      <ThemeModeSelector />
      
      <Separator className="my-8" />
      
      <BrandThemeSelector />
    </div>
  );
}

/* ----------------------- Theme Mode Selector ----------------------- */

const ThemeModeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-foreground">Interface Theme</h4>
        <p className="text-xs text-muted-foreground">
          Select your preferred background mode.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Light Mode Card */}
        <ThemeCard
          label="Light"
          active={theme === "light"}
          onClick={() => setTheme("light")}
          icon={<Sun className="size-4" />}
        >
          <div className="relative h-full w-full bg-[#f4f4f5] p-2.5">
            <div className="flex h-full gap-2">
              {/* Sidebar Wireframe */}
              <div className="w-1/4 h-full rounded-l-md bg-white border border-gray-200/50 shadow-sm flex flex-col gap-1.5 p-1.5">
                 <div className="h-1.5 w-1/2 rounded-full bg-gray-200" />
                 <div className="h-1.5 w-full rounded-full bg-gray-100 mt-2" />
                 <div className="h-1.5 w-3/4 rounded-full bg-gray-100" />
                 <div className="h-1.5 w-full rounded-full bg-gray-100" />
              </div>
              {/* Content Wireframe */}
              <div className="flex-1 h-full rounded-r-md bg-white border border-gray-200/50 shadow-sm p-2 flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gray-200" />
                    <div className="h-1.5 w-20 rounded-full bg-gray-200" />
                 </div>
                 <div className="h-16 w-full rounded-md bg-gray-50 border border-dashed border-gray-200" />
              </div>
            </div>
          </div>
        </ThemeCard>

        {/* Dark Mode Card */}
        <ThemeCard
          label="Dark"
          active={theme === "dark"}
          onClick={() => setTheme("dark")}
          icon={<Moon className="size-4" />}
        >
          <div className="relative h-full w-full bg-slate-950 p-2.5">
            <div className="flex h-full gap-2">
              {/* Sidebar Wireframe */}
              <div className="w-1/4 h-full rounded-l-md bg-slate-900 border border-slate-800 shadow-sm flex flex-col gap-1.5 p-1.5">
                 <div className="h-1.5 w-1/2 rounded-full bg-slate-700" />
                 <div className="h-1.5 w-full rounded-full bg-slate-800 mt-2" />
                 <div className="h-1.5 w-3/4 rounded-full bg-slate-800" />
                 <div className="h-1.5 w-full rounded-full bg-slate-800" />
              </div>
              {/* Content Wireframe */}
              <div className="flex-1 h-full rounded-r-md bg-slate-900 border border-slate-800 shadow-sm p-2 flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-slate-800" />
                    <div className="h-1.5 w-20 rounded-full bg-slate-800" />
                 </div>
                 <div className="h-16 w-full rounded-md bg-slate-950 border border-dashed border-slate-800" />
              </div>
            </div>
          </div>
        </ThemeCard>

        {/* System Mode Card */}
        <ThemeCard
          label="System"
          active={theme === "system"}
          onClick={() => setTheme("system")}
          icon={<Laptop className="size-4" />}
        >
          <div className="flex h-full w-full items-center justify-center bg-muted/30">
             <div className="relative">
                 <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
                 <Laptop className="relative h-12 w-12 text-muted-foreground/40" strokeWidth={1} />
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
  icon
}: {
  children: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-2 text-left focus:outline-none",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] w-full overflow-hidden rounded-xl border-2 transition-all duration-300",
          active 
            ? "border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background" 
            : "border-muted hover:border-foreground/20"
        )}
      >
        {children}
        
        {/* Checkmark Badge */}
        {active && (
            <div className="absolute right-2 top-2 z-10 rounded-full bg-primary p-1 text-primary-foreground shadow-sm animate-in zoom-in-50 duration-200">
                <Check className="h-3 w-3" strokeWidth={3} />
            </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-1">
          {icon && <span className={cn("text-muted-foreground", active && "text-primary")}>{icon}</span>}
          <span className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
            {label}
          </span>
      </div>
    </button>
  );
}

/* ----------------------- Brand Theme Selector ----------------------- */

const BrandThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useStorage<BrandThemeType>(
    "theme-brand",
    brand_themes[0]
  );

  React.useEffect(() => {
    // Safety check to ensure we match by ID or default to first
    const selected = brand_themes.find((t) => t.id === currentTheme.id || t.color === currentTheme.color) || brand_themes[0];
    
    if (selected) {
      const root = document.documentElement;
      root.style.setProperty("--primary", selected.color);
      root.style.setProperty("--ring", selected.color);
    }
  }, [currentTheme]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-foreground">Accent Color</h4>
        <p className="text-xs text-muted-foreground">
          Choose the primary color for buttons, links, and highlights.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {brand_themes.map((brandTheme) => {
          const isActive = currentTheme.id === brandTheme.id;
          
          return (
            <button
              key={brandTheme.id}
              onClick={() => setCurrentTheme(brandTheme)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all hover:bg-muted/50 focus:outline-none",
                isActive 
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs" 
                    : "border-border hover:border-foreground/20"
              )}
            >
              <div 
                className={cn(
                    "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-105",
                    isActive && "scale-105"
                )}
                style={{ backgroundColor: brandTheme.color }}
              >
                  {isActive && <Check className="size-3 text-white stroke-[3]" />}
              </div>
              
              <div className="flex-1 truncate text-xs font-medium text-foreground">
                {brandTheme.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};