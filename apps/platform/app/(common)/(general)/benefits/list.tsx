"use client";

import AdUnit from "@/components/common/adsense";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Award,
  Clapperboard,
  Cpu,
  Gift,
  GraduationCap,
  HeartPulse,
  LayoutGrid,
  type LucideIcon,
  Search,
  ShoppingBag,
  Sparkles,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { useMemo } from "react";

export type Perk = {
  key: string;
  name: string;
  logo: string;
  value?: string;
  description: string;
  href: string;
  category: string;
  region: string;
  regionLabel: string;
  tags: string[];
  isNew: boolean;
};

export type Option = { id: string; label: string };

const categoryIcons: Record<string, LucideIcon> = {
  all: LayoutGrid,
  "free-stuff": Gift,
  fellowships: Award,
  "Software and Tools": Wrench,
  Technology: Cpu,
  Education: GraduationCap,
  Entertainment: Clapperboard,
  Shopping: ShoppingBag,
  "Health and Wellbeing": HeartPulse,
};

const iconFor = (id: string) => categoryIcons[id] ?? Sparkles;

type Props = {
  perks: Perk[];
  categories: Option[];
  regions: Option[];
};

export default function BenefitsExplorer({
  perks,
  categories,
  regions,
}: Props) {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const [region, setRegion] = useQueryState("region", { defaultValue: "all" });
  const [category, setCategory] = useQueryState("category", {
    defaultValue: "all",
  });

  const categoryLabels = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.label])),
    [categories]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return perks.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        // Worldwide offers stay visible under every country filter.
        (region === "all" || p.region === region || p.region === "worldwide") &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [perks, query, region, category]);

  const clear = () => {
    setQuery(null);
    setRegion(null);
    setCategory(null);
  };

  return (
    <section
      id="benefits"
      aria-labelledby="benefits-heading"
      className="flex scroll-mt-24 flex-col gap-6"
    >
      <h2 id="benefits-heading" className="sr-only">
        Browse perks
      </h2>

      <form
        aria-label="Search perks"
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto w-full max-w-3xl rounded-3xl border border-border bg-card/85 p-2 shadow-lg backdrop-blur-xl"
      >
        <fieldset className="no-scrollbar flex min-w-0 gap-1 overflow-x-auto border-0 p-1">
          <legend className="sr-only">Filter by category</legend>
          {categories.map((c) => {
            const active = category === c.id;
            const Icon = iconFor(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-xl border px-2 pr-3 text-body outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-border bg-background font-medium text-foreground shadow-xs"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-md border",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                {c.label}
              </button>
            );
          })}
        </fieldset>

        <div className="mt-1 flex h-14 items-center gap-3 rounded-2xl bg-muted pr-2 pl-4 focus-within:ring-2 focus-within:ring-ring">
          <Search
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="perk-search" className="sr-only">
            Search perks
          </label>
          <input
            id="perk-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value || null)}
            placeholder="GitHub, Notion, cloud credits..."
            className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-placeholder md:text-body-lg"
          />
          <label htmlFor="perk-region" className="sr-only">
            Region
          </label>
          <select
            id="perk-region"
            value={region}
            onChange={(e) =>
              setRegion(e.target.value === "all" ? null : e.target.value)
            }
            className="h-10 max-w-36 shrink-0 cursor-pointer rounded-full border border-border bg-background px-3 text-body text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      <p
        className="text-center text-body text-muted-foreground"
        aria-live="polite"
      >
        {results.length === 0
          ? "No perks match these filters."
          : `${results.length} ${results.length === 1 ? "perk" : "perks"}`}
      </p>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center dark:bg-background">
          <p className="text-body text-muted-foreground">
            Try another search, category or region.
          </p>
          <Button variant="outline" onClick={clear}>
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((p) => (
              <li key={p.key}>
                <PerkCard
                  perk={p}
                  categoryLabel={categoryLabels[p.category] ?? p.category}
                />
              </li>
            ))}
          </ul>
          {category === "all" && <AdUnit adSlot="display-horizontal" />}
        </>
      )}
    </section>
  );
}

function PerkCard({
  perk,
  categoryLabel,
}: {
  perk: Perk;
  categoryLabel: string;
}) {
  const Fallback = iconFor(perk.category);
  return (
    <a
      href={perk.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring dark:bg-background"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-background p-1.5 text-foreground">
          {perk.logo ? (
            <Image
              src={perk.logo}
              alt=""
              width={28}
              height={28}
              className="size-full object-contain"
              unoptimized
            />
          ) : (
            <Fallback className="size-5" aria-hidden="true" />
          )}
        </span>
        {perk.isNew && (
          <span className="rounded-full border border-border px-2 py-0.5 text-caption font-medium text-primary">
            New
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-body-lg font-medium text-foreground">
          {perk.name}
        </h3>
        <p className="text-caption text-muted-foreground">
          {categoryLabel} · {perk.regionLabel}
        </p>
        {perk.description && (
          <p className="mt-1 text-body text-muted-foreground">
            {perk.description}
          </p>
        )}
      </div>

      {(perk.value || perk.tags.length > 0) && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Details">
          {perk.value && (
            <li className="rounded-full border border-border px-2 py-0.5 text-caption font-medium text-foreground">
              {perk.value.startsWith("$") ? `${perk.value} value` : perk.value}
            </li>
          )}
          {perk.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2 py-0.5 text-caption text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <span className="flex items-center gap-1 text-body font-medium text-primary">
        Get offer
        <ArrowUpRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
        <span className="sr-only">(opens in a new tab)</span>
      </span>
    </a>
  );
}
