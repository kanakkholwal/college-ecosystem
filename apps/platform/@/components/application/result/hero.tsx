import Link from "next/link";

type QuickFilter = { batch: string; programme: string };

/** The newest batches first, so the shortcuts stay stable between visits instead of shuffling. */
export function pickQuickFilters(
  batches: (string | number)[],
  programmes: string[],
  count = 4
): QuickFilter[] {
  const newest = [...batches].map(String).sort((a, b) => Number(b) - Number(a));
  const out: QuickFilter[] = [];
  for (const batch of newest) {
    for (const programme of programmes) {
      out.push({ batch, programme });
      if (out.length === count) return out;
    }
  }
  return out;
}

export function QuickFilters({ filters }: { filters: QuickFilter[] }) {
  if (filters.length === 0) return null;
  return (
    <nav
      aria-label="Quick filters"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      <span className="text-body text-muted-foreground">Try</span>
      {filters.map((filter) => (
        <Link
          key={filter.batch + filter.programme}
          href={{
            pathname: "/results",
            query: { batch: filter.batch, programme: filter.programme },
          }}
          className="flex h-9 items-center rounded-lg border border-border bg-card px-3 text-body text-foreground transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none dark:bg-background"
        >
          {filter.programme} {filter.batch}
        </Link>
      ))}
    </nav>
  );
}
