import {
  Ban,
  CircleCheck,
  FileSpreadsheet,
  SearchX,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  EmptyNote,
  SectionError,
} from "@/components/application/dashboard/primitives";
import {
  campusFormat,
  TableFrame,
  Td,
  Th,
} from "@/components/application/hostel/ui";
import { HeaderBar } from "@/components/common/header-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLink } from "@/components/utils/link";
import { getHostelResidents } from "~/actions/hostel.core";
import { ImportResidents, ResidentSearch } from "./client";

type RawParams = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function ResidentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ moderator: string; slug: string }>;
  searchParams: Promise<RawParams>;
}) {
  const [{ moderator, slug }, raw] = await Promise.all([params, searchParams]);
  const importing = one(raw.view) === "import";
  const base = `/${moderator}/h/${slug}`;
  const filters = {
    query: (one(raw.query) ?? "").trim().toLowerCase(),
    status: one(raw.status) ?? null,
    room: one(raw.room) ?? null,
  };

  return (
    <div className="@container flex flex-col gap-6">
      <HeaderBar
        Icon={Users}
        titleNode="Residents"
        descriptionNode="Students allotted to this hostel, their rooms and outpass access."
        actionNode={
          importing ? (
            <ButtonLink href={`${base}/students`} variant="outline">
              Back to residents
            </ButtonLink>
          ) : (
            <ButtonLink href={`${base}/students?view=import`} variant="primary">
              <FileSpreadsheet aria-hidden="true" />
              Import from sheet
            </ButtonLink>
          )
        }
      />
      {importing ? (
        <ImportResidents slug={slug} />
      ) : (
        <>
          <ResidentSearch />
          <Suspense
            key={JSON.stringify(filters)}
            fallback={<ResidentsSkeleton />}
          >
            <ResidentsTable slug={slug} base={base} filters={filters} />
          </Suspense>
        </>
      )}
    </div>
  );
}

async function ResidentsTable({
  slug,
  base,
  filters,
}: {
  slug: string;
  base: string;
  filters: { query: string; status: string | null; room: string | null };
}) {
  const res = await getHostelResidents(slug);
  if (!res.ok) return <SectionError what="Residents" />;

  if (res.data.length === 0) {
    return (
      <EmptyNote
        icon={<Users />}
        title="No residents yet"
        description="Import a sheet of roll numbers, names and CGPI to add residents."
        action={
          <ButtonLink href={`${base}/students?view=import`} variant="primary">
            Import from sheet
          </ButtonLink>
        }
      />
    );
  }

  const now = Date.now();
  const rows = res.data
    .map((r) => ({
      ...r,
      barred:
        r.banned && (!r.bannedTill || new Date(r.bannedTill).getTime() > now),
    }))
    .filter((r) => {
      const q = filters.query;
      if (
        q &&
        !r.name.toLowerCase().includes(q) &&
        !r.rollNumber.toLowerCase().includes(q) &&
        !r.roomNumber.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (filters.status === "banned" && !r.barred) return false;
      if (filters.status === "active" && r.barred) return false;
      if (filters.room === "unknown" && r.roomNumber !== "UNKNOWN")
        return false;
      if (filters.room === "assigned" && r.roomNumber === "UNKNOWN")
        return false;
      return true;
    });

  if (rows.length === 0) {
    return (
      <EmptyNote
        icon={<SearchX />}
        title="No residents match"
        description={`None of the ${res.data.length} residents match that search.`}
        action={
          <ButtonLink href="?" variant="outline">
            Clear search and filters
          </ButtonLink>
        }
      />
    );
  }

  const summary = `${rows.length} of ${res.data.length} residents`;
  return (
    <section aria-label="Residents" className="flex flex-col gap-3">
      <p className="text-body text-muted-foreground" aria-live="polite">
        {summary}
      </p>
      <TableFrame caption={summary}>
        <thead>
          <tr>
            <Th>Resident</Th>
            <Th>Room</Th>
            <Th className="hidden @2xl:table-cell">CGPI</Th>
            <Th>Outpass access</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r._id}
              className="group/row transition-colors duration-150 hover:bg-muted"
            >
              <Td>
                <Link
                  href={`${base}/outpass-logs/${r._id}`}
                  className="block rounded-sm font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {r.name}
                </Link>
                <span className="block font-mono text-caption text-muted-foreground">
                  {r.rollNumber}
                </span>
              </Td>
              <Td className="whitespace-nowrap">
                {r.roomNumber === "UNKNOWN" ? (
                  <span className="text-muted-foreground">Not set</span>
                ) : (
                  <span className="font-mono">{r.roomNumber}</span>
                )}
              </Td>
              <Td className="hidden tabular-nums @2xl:table-cell">
                {r.cgpi !== null ? (
                  r.cgpi.toFixed(2)
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </Td>
              <Td>
                {r.barred ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-destructive">
                    <Ban className="size-4" aria-hidden="true" />
                    Barred
                    {r.bannedTill && (
                      <span className="font-normal text-muted-foreground">
                        until{" "}
                        {campusFormat(r.bannedTill, {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-foreground">
                    <CircleCheck
                      className="size-4 text-success"
                      aria-hidden="true"
                    />
                    Allowed
                  </span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableFrame>
    </section>
  );
}

function ResidentsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <span className="sr-only">Loading residents</span>
      <Skeleton className="h-5 w-40 bg-muted" />
      <div className="rounded-2xl border border-border bg-card dark:bg-background">
        <div className="h-11 border-b border-border" />
        {Array.from({ length: 8 }, (_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
            key={i}
            className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40 bg-muted" />
              <Skeleton className="h-3 w-24 bg-muted" />
            </div>
            <Skeleton className="h-4 w-16 bg-muted" />
            <Skeleton className="h-4 w-20 bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
