import { EmptyNote } from "@/components/application/dashboard/primitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  SearchX,
  TriangleAlert,
  Users,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "~/auth";
import { PageSizeSelect, UserRowActions } from "./users-controls";
import { departmentShort, formatDate, initials, roleLabel } from "./shared";

export const PAGE_SIZES = [10, 20, 50, 100] as const satisfies number[];
export const SORT_FIELDS = ["name", "department", "createdAt"] as const;

export type UsersQuery = {
  query: string;
  field: "email" | "name";
  role: "admin" | "user" | null;
  sort: (typeof SORT_FIELDS)[number];
  dir: "asc" | "desc";
  page: number;
  size: number;
};

type Row = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  otherRoles: string[];
  department: string;
  emailVerified: boolean;
  createdAt: Date;
};

function toSearch(query: UsersQuery, patch: Partial<UsersQuery>) {
  const next = { ...query, ...patch };
  const params = new URLSearchParams();
  if (next.query) params.set("query", next.query);
  if (next.field !== "email") params.set("field", next.field);
  if (next.role) params.set("role", next.role);
  if (next.sort !== "createdAt") params.set("sort", next.sort);
  if (next.dir !== "desc") params.set("dir", next.dir);
  if (next.page > 1) params.set("page", String(next.page));
  if (next.size !== PAGE_SIZES[0]) params.set("size", String(next.size));
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}

async function fetchUsers(query: UsersQuery) {
  const res = await auth.api.listUsers({
    headers: await headers(),
    query: {
      limit: query.size,
      offset: (query.page - 1) * query.size,
      sortBy: query.sort,
      sortDirection: query.dir,
      ...(query.query && {
        searchField: query.field,
        searchOperator: "contains" as const,
        // Names are stored upper-case; emails lower-case.
        searchValue:
          query.field === "name"
            ? query.query.toUpperCase()
            : query.query.toLowerCase(),
      }),
      ...(query.role && {
        filterField: "role",
        filterOperator: "eq" as const,
        filterValue: query.role,
      }),
    },
  });
  const rows: Row[] = res.users.map((user) => {
    const extra = user as typeof user & {
      other_roles?: string[];
      department?: string;
    };
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      role: user.role ?? "user",
      otherRoles: extra.other_roles ?? [],
      department: extra.department ?? "",
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  });
  return { rows, total: res.total ?? rows.length };
}

export async function UsersResults({
  query,
  basePath,
}: {
  query: UsersQuery;
  basePath: string;
}) {
  let data: Awaited<ReturnType<typeof fetchUsers>>;
  try {
    data = await fetchUsers(query);
  } catch (error) {
    console.error("listUsers failed:", error);
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 dark:bg-background"
      >
        <TriangleAlert
          className="mt-0.5 size-5 shrink-0 text-destructive"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-body font-medium text-foreground">
            Users couldn't load
          </p>
          <p className="text-body text-muted-foreground">
            Only accounts with the admin role can list users. If you are an
            admin, refresh the page to try again.
          </p>
        </div>
      </div>
    );
  }

  const { rows, total } = data;
  const filtered = Boolean(query.query || query.role);

  if (rows.length === 0) {
    if (total > 0) {
      return (
        <EmptyNote
          icon={<SearchX />}
          title="This page is empty"
          description={`There are ${total.toLocaleString("en-IN")} matching users, on earlier pages.`}
          action={
            <ButtonLink href={toSearch(query, { page: 1 })} variant="outline">
              Go to the first page
            </ButtonLink>
          }
        />
      );
    }
    return filtered ? (
      <EmptyNote
        icon={<SearchX />}
        title="No users match"
        description="Check the spelling, or search by the other field from Filters."
        action={
          <ButtonLink href="?" variant="outline">
            Clear search and filters
          </ButtonLink>
        }
      />
    ) : (
      <EmptyNote
        icon={<Users />}
        title="No users yet"
        description="Accounts appear here once people sign up or you add them."
        action={
          <ButtonLink href={`${basePath}/new`} variant="primary">
            Add user
          </ButtonLink>
        }
      />
    );
  }

  const from = (query.page - 1) * query.size + 1;
  const to = from + rows.length - 1;
  const pageCount = Math.max(1, Math.ceil(total / query.size));
  const summary = `Showing ${from.toLocaleString("en-IN")} to ${to.toLocaleString("en-IN")} of ${total.toLocaleString("en-IN")} users`;

  return (
    <section aria-label="Users" className="flex flex-col gap-3">
      <p className="text-body text-muted-foreground" aria-live="polite">
        {summary}
        {query.query && (
          <>
            {" "}
            for <span className="text-foreground">"{query.query}"</span>
          </>
        )}
        {query.role && <> with the {roleLabel(query.role)} role</>}
      </p>

      <UserCards rows={rows} basePath={basePath} />

      <div className="hidden overflow-clip rounded-2xl border border-border bg-card @2xl:block dark:bg-background">
        <table className="w-full border-separate border-spacing-0 text-body">
          <caption className="sr-only">{summary}</caption>
          <thead>
            <tr>
              <SortHeader label="User" field="name" query={query} />
              <Th>Role</Th>
              <SortHeader
                label="Department"
                field="department"
                query={query}
                className="hidden @5xl:table-cell"
              />
              <Th className="hidden @3xl:table-cell">Email</Th>
              <SortHeader label="Joined" field="createdAt" query={query} />
              <Th className="w-14">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const href = `${basePath}/${row.id}`;
              return (
                <tr
                  key={row.id}
                  className="transition-colors duration-150 hover:bg-muted [&:last-child>td]:border-b-0"
                >
                  <Td>
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar row={row} />
                      <div className="min-w-0">
                        <Link
                          href={href}
                          className="block truncate rounded-sm font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {row.name}
                        </Link>
                        <p className="truncate text-caption text-muted-foreground">
                          {row.email}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Roles row={row} />
                  </Td>
                  <Td className="hidden @5xl:table-cell">
                    <span
                      className="text-muted-foreground"
                      title={row.department}
                    >
                      {departmentShort(row.department)}
                    </span>
                  </Td>
                  <Td className="hidden @3xl:table-cell">
                    <Verification verified={row.emailVerified} />
                  </Td>
                  <Td className="whitespace-nowrap tabular-nums text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </Td>
                  <Td className="text-right">
                    <UserRowActions
                      id={row.id}
                      name={row.name}
                      email={row.email}
                      href={href}
                    />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <nav
        aria-label="Pagination"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <PageSizeSelect value={query.size} sizes={PAGE_SIZES} />
        <div className="flex items-center gap-2">
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
        </div>
      </nav>
    </section>
  );
}

function Th({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "sticky top-0 z-10 h-11 border-b border-border bg-card px-4 text-left text-caption font-medium text-muted-foreground dark:bg-background",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "max-w-72 border-b border-border px-4 py-3 align-middle",
        className
      )}
    >
      {children}
    </td>
  );
}

function SortHeader({
  label,
  field,
  query,
  className,
}: {
  label: string;
  field: UsersQuery["sort"];
  query: UsersQuery;
  className?: string;
}) {
  const active = query.sort === field;
  // Dates read newest first; text reads A to Z first.
  const firstDir = field === "createdAt" ? "desc" : "asc";
  const nextDir = active ? (query.dir === "asc" ? "desc" : "asc") : firstDir;
  const Glyph = !active ? ArrowUpDown : query.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <Th
      className={className}
      aria-sort={
        active ? (query.dir === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <Link
        href={toSearch(query, { sort: field, dir: nextDir, page: 1 })}
        scroll={false}
        className={cn(
          "-ml-2 inline-flex h-8 items-center gap-1.5 rounded-md px-2 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          active && "text-foreground"
        )}
      >
        {label}
        <Glyph className="size-3.5" aria-hidden="true" />
        <span className="sr-only">
          , sort {nextDir === "asc" ? "ascending" : "descending"}
        </span>
      </Link>
    </Th>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <Button variant="outline" size="icon_sm" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <ButtonLink
      href={href}
      variant="outline"
      size="icon_sm"
      aria-label={label}
      scroll={false}
    >
      {children}
    </ButtonLink>
  );
}

function UserAvatar({ row }: { row: Row }) {
  return (
    <Avatar className="size-9 shrink-0 border border-border">
      {row.image && <AvatarImage src={row.image} alt="" />}
      <AvatarFallback className="bg-muted text-caption font-medium text-muted-foreground">
        {initials(row.name)}
      </AvatarFallback>
    </Avatar>
  );
}

function Roles({ row }: { row: Row }) {
  const extra = row.otherRoles.filter((role) => role !== row.role);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          "inline-flex h-6 items-center rounded-full border px-2 text-caption font-medium",
          row.role === "admin"
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-foreground"
        )}
      >
        {roleLabel(row.role)}
      </span>
      {extra.slice(0, 2).map((role) => (
        <span
          key={role}
          className="inline-flex h-6 items-center rounded-full border border-border px-2 text-caption text-muted-foreground"
        >
          {roleLabel(role)}
        </span>
      ))}
      {extra.length > 2 && (
        <span
          className="text-caption text-muted-foreground"
          title={extra.slice(2).map(roleLabel).join(", ")}
        >
          +{extra.length - 2} more
        </span>
      )}
    </div>
  );
}

function Verification({ verified }: { verified: boolean }) {
  const Glyph = verified ? CircleCheck : CircleAlert;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        verified ? "text-success" : "text-warning"
      )}
    >
      <Glyph className="size-4" aria-hidden="true" />
      {verified ? "Verified" : "Not verified"}
    </span>
  );
}

function UserCards({ rows, basePath }: { rows: Row[]; basePath: string }) {
  return (
    <ul className="flex flex-col gap-2 @2xl:hidden">
      {rows.map((row) => {
        const href = `${basePath}/${row.id}`;
        return (
          <li
            key={row.id}
            className="relative flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-200 has-[a:hover]:border-border-strong has-[a:hover]:shadow-md dark:bg-background"
          >
            <UserAvatar row={row} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="min-w-0">
                <Link
                  href={href}
                  className="block truncate rounded-sm font-medium text-foreground outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
                >
                  {row.name}
                </Link>
                <p className="truncate text-caption text-muted-foreground">
                  {row.email}
                </p>
              </div>
              <Roles row={row} />
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted-foreground">
                <Verification verified={row.emailVerified} />
                <span>Joined {formatDate(row.createdAt)}</span>
              </p>
            </div>
            <div className="relative z-10 -mr-1 -mt-1">
              <UserRowActions
                id={row.id}
                name={row.name}
                email={row.email}
                href={href}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function UsersResultsSkeleton({ rows }: { rows: number }) {
  const count = Math.min(rows, 10);
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <span className="sr-only">Loading users</span>
      <Skeleton className="h-5 w-56 bg-muted" />
      <div className="flex flex-col gap-2 @2xl:hidden">
        {Array.from({ length: Math.min(count, 5) }, (_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
            key={i}
            className="h-28 w-full rounded-2xl bg-muted"
          />
        ))}
      </div>
      <div className="hidden rounded-2xl border border-border bg-card @2xl:block dark:bg-background">
        <div className="h-11 border-b border-border" />
        {Array.from({ length: count }, (_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
            key={i}
            className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <Skeleton className="size-9 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40 bg-muted" />
              <Skeleton className="h-3 w-56 bg-muted" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full bg-muted" />
            <Skeleton className="hidden h-4 w-24 bg-muted @3xl:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
