"use client";

import { Panel } from "@/components/application/dashboard/primitives";
import {
  type BrandThemeType,
  brand_themes,
} from "@/components/common/theme-switcher";
import { Skeleton } from "@/components/ui/skeleton";
import useStorage from "@/hooks/use-storage";
import { cn } from "@/lib/utils";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const MODES = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Laptop },
] as const;

// Same contract as the navbar popover: presets apply through data-brand, never inline styles.
function applyBrand(themeId: string) {
  const root = document.documentElement;
  root.style.removeProperty("--primary");
  root.style.removeProperty("--ring");
  if (themeId === brand_themes[0].id) delete root.dataset.brand;
  else root.dataset.brand = themeId;
}

export default function AppearanceForm() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Panel as="section" className="@container">
      <div className="mb-5 space-y-1">
        <h2 className="text-subheading font-medium text-foreground">
          Appearance
        </h2>
        <p className="text-body text-muted-foreground">
          Saved on this device and applied straight away.
        </p>
      </div>
      {mounted ? (
        <div className="flex flex-col">
          <ModeSetting />
          <AccentSetting />
        </div>
      ) : (
        <div className="flex flex-col gap-5" aria-busy="true">
          <Skeleton className="h-28 w-full rounded-xl bg-muted" />
          <Skeleton className="h-40 w-full rounded-xl bg-muted" />
        </div>
      )}
    </Panel>
  );
}

function SettingGroup({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid min-w-0 grid-cols-1 gap-3 border-t border-border py-5 first:border-t-0 first:pt-0 last:pb-0 @xl:grid-cols-[14rem_minmax(0,1fr)] @xl:gap-6">
      <div className="space-y-1">
        <legend className="float-left text-body font-medium text-foreground">
          {label}
        </legend>
        <p className="clear-left text-caption text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </fieldset>
  );
}

const optionClass = (checked: boolean) =>
  cn(
    "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-body transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-ring",
    checked
      ? "border-primary bg-primary/10 font-medium text-foreground"
      : "border-border text-foreground hover:bg-muted"
  );

function ModeSetting() {
  const { theme, setTheme } = useTheme();
  return (
    <SettingGroup
      label="Mode"
      description="System follows your device's light or dark setting."
    >
      <div className="grid grid-cols-1 gap-2 @sm:grid-cols-3">
        {MODES.map(({ id, label, Icon }) => {
          const checked = theme === id;
          return (
            <label key={id} className={cn(optionClass(checked), "h-11")}>
              <input
                type="radio"
                name="theme-mode"
                value={id}
                checked={checked}
                onChange={() => setTheme(id)}
                className="sr-only"
              />
              <Icon
                className={cn(
                  "size-4",
                  checked ? "text-primary" : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
              <span className="flex-1">{label}</span>
              {checked && (
                <Check className="size-4 text-primary" aria-hidden="true" />
              )}
            </label>
          );
        })}
      </div>
    </SettingGroup>
  );
}

function AccentSetting() {
  const [current, setCurrent] = useStorage<BrandThemeType>(
    "theme-brand",
    brand_themes[0]
  );
  const currentId =
    brand_themes.find((t) => t.id === current?.id)?.id ?? brand_themes[0].id;

  useEffect(() => applyBrand(currentId), [currentId]);

  return (
    <SettingGroup
      label="Accent colour"
      description="Colours buttons, links and highlights. Each one keeps text readable in both modes."
    >
      <div className="grid grid-cols-2 gap-2 @sm:grid-cols-3 @2xl:grid-cols-4">
        {brand_themes.map((brand) => {
          const checked = currentId === brand.id;
          return (
            <label key={brand.id} className={cn(optionClass(checked), "h-10")}>
              <input
                type="radio"
                name="theme-brand"
                value={brand.id}
                checked={checked}
                onChange={() => setCurrent(brand)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="grid size-5 shrink-0 place-items-center rounded-full border border-border"
                style={{ backgroundColor: brand.color }}
              >
                {checked && <Check className="size-3 text-fixed-light" />}
              </span>
              <span className="min-w-0 flex-1 truncate">{brand.label}</span>
            </label>
          );
        })}
      </div>
    </SettingGroup>
  );
}
