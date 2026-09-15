import { ChevronLeft, ChevronRight, History, SearchX } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  EmptyNote,
  SectionError,
} from "@/components/application/dashboard/primitives";
import {
  OUTPASS_STATUS_META,
  OutpassStatusTag,
  PageLink,
  REASON_LABEL,
  shortDateTime,
  TableFrame,
  Td,
  Th,
} from "@/components/application/hostel/ui";
import { HeaderBar } from "@/components/common/header-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLink } from "@/components/utils/link";
import { getOutPassHistoryForHostel } from "~/actions/hostel.outpass";
import { OUTPASS_STATUS } from "~/constants/hostel.outpass";
import type { OutPassType } from "~/models/hostel_n_outpass";
import { OutpassLogSearch } from "./search";

const PAGE_SIZE = 25;

type RawParams = Record<string, string | string[] | undefined>;
type LogQuery = {
  query: string;
  status: OutPassType["status"] | null;
  sort: "asc" | "desc";
  page: number;
};

const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function parseQuery(raw: RawParams): LogQuery {
  const status = one(raw.status);
  const page = Number(one(raw.page));
  return {
    query: (one(raw.query) ?? "").trim(),
    status: OUTPASS_STATUS.includes(status as OutPassType["status"])
      ? (status as OutPassType["status"])
      : null,
    sort: one(raw.sort) === "asc" ? "asc" : "desc",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

function toSearch(query: LogQuery, patch: Partial<LogQuery>) {
  const next = { ...query, ...patch };
  const params = new URLSearchParams();
  if (next.query) params.set("query", next.query);
  if (next.status) params.set("status", next.status);
  if (next.sort === "asc") params.set("sort", "asc");
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}

export default async function OutpassLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ moderator: string; slug: string }>;
  searchParams: Promise<RawParams>;
}) {
  const [{ moderator, slug }, raw] = await Promise.all([params, searchParams]);
  const query = parseQuery(raw);
  const base = `/${moderator}/h/${slug}`;

  return (
    <div className="@container flex flex-col gap-6">
      <HeaderBar
        Icon={History}
        titleNode="Outpass logs"
        descriptionNode="Every request from this hostel with its exit and return times."
        actionNode={
          <ButtonLink href={`${base}/outpass-requests`} variant="outline">
            Pending queue
          </ButtonLink>
        }
      />
      <OutpassLogSearch />
      <Suspense key={JSON.stringify(query)} fallback={<LogsSkeleton />}>
        <LogResults slug={slug} base={base} query={query} />
      </Suspense>
    </div>
  );
}

async function LogResults({
  slug,
  base,
  query,
}: {
  slug: string;
  base: string;
  query: LogQuery;
}) {
  const res = await getOutPassHistoryForHostel({
    slug,
    query: query.query,
    status: query.status ?? undefined,
    page: query.page,
    limit: PAGE_SIZE,
    sortBy: query.sort,
  });
  if (!res.ok) return <SectionError what="Outpass logs" />;

  const { rows, total } = res.data;
  const filtered = Boolean(query.query || query.status);

  if (rows.length === 0) {
    return filtered || query.page > 1 ? (
      <EmptyNote
        icon={<SearchX />}
        title="No outpasses match"
        description="Check the roll number, or clear the status filter."
        action={
          <ButtonLink href="?" variant="outline">
            Clear search and filters
          </ButtonLink>
        }
      />
    ) : (
      <EmptyNote
        icon={<History />}
        title="No outpasses yet"
        description="Requests from residents are logged here once they're sent."
      />
    );
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = (query.page - 1) * PAGE_SIZE + 1;
  const to = from + rows.length - 1;
  const summary = `Showing ${from} to ${to} of ${total.toLocaleString("en-IN")} outpasses${query.status ? `, ${OUTPASS_STATUS_META[query.status].label.toLowerCase()}` : ""}`;

  return (
    <section aria-label="Outpass logs" className="flex flex-col gap-3">
      <p className="text-body text-muted-foreground" aria-live="polite">
        {summary}
      </p>
      <TableFrame caption={summary}>
        <thead>
          <tr>
            <Th>Student</Th>
            <Th>Status</Th>
            <Th className="hidden @2xl:table-cell">Reason</Th>
            <Th>Out</Th>
            <Th className="hidden @3xl:table-cell">Back</Th>
            <Th className="hidden @4xl:table-cell">Requested</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row._id}
              className="group/row transition-colors duration-150 hover:bg-muted"
            >
              <Td>
                {row.student ? (
                  <Link
                    href={`${base}/outpass-logs/${row.student._id}`}
                    className="block rounded-sm font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {row.student.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Unknown student</span>
                )}
                <span className="block font-mono text-caption text-muted-foreground">
                  {row.student?.rollNumber ?? "No roll number"}, room{" "}
                  {row.roomNumber}
                </span>
              </Td>
              <Td>
                <OutpassStatusTag status={row.status} />
              </Td>
              <Td className="hidden @2xl:table-cell">
                {REASON_LABEL[row.reason] ?? row.reason}
              </Td>
              <Td className="whitespace-nowrap tabular-nums">
                {shortDateTime(row.actualOutTime ?? row.expectedOutTime)}
                <span className="block text-caption text-muted-foreground">
                  {row.actualOutTime ? "Exited" : "Planned"}
                </span>
              </Td>
              <Td className="hidden whitespace-nowrap tabular-nums @3xl:table-cell">
                {shortDateTime(row.actualInTime ?? row.expectedInTime)}
                <span className="block text-caption text-muted-foreground">
                  {row.actualInTime
                    ? new Date(row.actualInTime) > new Date(row.expectedInTime)
                      ? "Returned late"
                      : "Returned"
                    : "Due"}
                </span>
              </Td>
              <Td className="hidden whitespace-nowrap tabular-nums text-muted-foreground @4xl:table-cell">
                {shortDateTime(row.createdAt)}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableFrame>
      <nav
        aria-label="Pagination"
        className="flex items-center justify-end gap-2"
      >
        <span className="text-body tabular-nums text-muted-foreground">
          Page {query.page} of {pageCount}
        </span>
        <PageLink
          href={toSearch(query, { page: query.page - 1 })}
          disabled={query.page <= 1}
          label="Previous page"
        >
          <ChevronLeft aria-hidden="true" />
        </PageLink>
        <PageLink
          href={toSearch(query, { page: query.page + 1 })}
          disabled={query.page >= pageCount}
          label="Next page"
        >
          <ChevronRight aria-hidden="true" />
        </PageLink>
      </nav>
    </section>
  );
}

function LogsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <span className="sr-only">Loading outpass logs</span>
      <Skeleton className="h-5 w-56 bg-muted" />
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
              <Skeleton className="h-3 w-28 bg-muted" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full bg-muted" />
            <Skeleton className="h-4 w-24 bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
