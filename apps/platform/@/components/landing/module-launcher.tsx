"use client";

import { getLinksByRole, quick_links } from "@/constants/links";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  LayoutGrid,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const categories = [
  { id: "all", name: "All modules", Icon: LayoutGrid },
  { id: "academic", name: "Academics", Icon: BookOpen },
  { id: "community", name: "Community", Icon: Users },
  { id: "general", name: "Perks", Icon: Sparkles },
];

/** Orbit's Explore launcher: category chips over one search field; Enter opens the best match. */
export function ModuleLauncher({ role }: { role: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const modules = useMemo(() => getLinksByRole(role, quick_links), [role]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modules
      .filter((m) => category === "all" || m.category === category)
      .filter(
        (m) =>
          !q ||
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
  }, [modules, query, category]);

  const open = () => {
    const best = results.find((m) => !m.disabled);
    if (best) router.push(best.href);
  };

  return (
    <div className="flex flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-1 py-10 text-center sm:py-14">
        <span className="flex w-fit rotate-1 items-center gap-2 rounded-md border border-border p-0.5 pl-2.5 text-caption font-semibold text-foreground">
          <span>
            <span className="text-primary">{modules.length} modules</span>, one
            sign-in
          </span>
          <span className="rounded-sm border border-border bg-background px-1.5 py-0.5">
            Free
          </span>
        </span>

        <h2 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
          What do you need
          <br />
          <span className="text-primary">on campus</span> today?
        </h2>
        <p className="mt-3 text-pretty text-body text-muted-foreground md:text-body-lg">
          Search for a module, or pick a category to browse.
        </p>

        <form
          aria-label="Search modules"
          onSubmit={(e) => {
            e.preventDefault();
            open();
          }}
          className="mt-8 w-full rounded-3xl border border-border bg-card/85 p-2 text-left shadow-lg backdrop-blur-xl"
        >
          <fieldset className="no-scrollbar flex min-w-0 gap-1 overflow-x-auto border-0 p-1">
            <legend className="sr-only">Filter by category</legend>
            {categories.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-2 rounded-xl border px-2 pr-3 text-body transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
                    <c.Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  {c.name}
                </button>
              );
            })}
          </fieldset>

          <label className="mt-1 flex h-14 items-center gap-3 rounded-2xl bg-muted pl-4 pr-2 focus-within:ring-2 focus-within:ring-ring">
            <Search
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="sr-only">Search modules</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Results, syllabus, free classroom..."
              className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none md:text-body-lg"
            />
            <button
              type="submit"
              aria-label="Open best match"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-action text-action-foreground transition-transform duration-100 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
            >
              <ArrowRight className="size-4" />
            </button>
          </label>
        </form>
        <p className="mt-4 text-body text-muted-foreground" aria-live="polite">
          {results.length === 0
            ? `No modules match “${query}”.`
            : `${results.length} ${results.length === 1 ? "module" : "modules"} · press Enter to open the first`}
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((m) => (
          <li key={m.href}>
            <ModuleCard {...m} />
          </li>
        ))}
      </ul>
    </div>
  );
}

type ModuleCardProps = (typeof quick_links)[number];

function ModuleCard({
  href,
  title,
  description,
  Icon,
  disabled,
  isNew,
}: ModuleCardProps) {
  return (
    <Link
      href={disabled ? "#" : href}
      aria-disabled={disabled}
      className={cn(
        "group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 outline-none transition-[border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring dark:bg-background",
        disabled
          ? "pointer-events-none"
          : "hover:border-border-strong hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-lg border border-border text-foreground transition-colors duration-200 group-hover:text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {isNew && (
          <span className="rounded-full border border-border px-2 py-0.5 text-caption font-medium text-primary">
            New
          </span>
        )}
        {disabled && (
          <span className="rounded-full border border-border px-2 py-0.5 text-caption font-medium text-muted-foreground">
            Soon
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="flex items-center gap-1.5 text-body-lg font-medium text-foreground">
          {title}
          {!disabled && (
            <ArrowRight
              aria-hidden="true"
              className="size-4 -translate-x-1 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100"
            />
          )}
        </h3>
        <p className="line-clamp-2 text-body text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}
