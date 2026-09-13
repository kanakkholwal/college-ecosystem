import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersSearch } from "./users-controls";
import {
  PAGE_SIZES,
  SORT_FIELDS,
  type UsersQuery,
  UsersResults,
  UsersResultsSkeleton,
} from "./users-table";

export const metadata: Metadata = {
  title: "Users",
  description:
    "Find accounts, check their access and open a user to manage it.",
};

type RawParams = Record<string, string | string[] | undefined>;

interface PageProps {
  params: Promise<{ moderator: string }>;
  searchParams: Promise<RawParams>;
}

const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function parseQuery(raw: RawParams): UsersQuery {
  const size = Number(one(raw.size));
  const page = Number(one(raw.page));
  const sort = one(raw.sort);
  const role = one(raw.role);
  return {
    query: (one(raw.query) ?? "").trim(),
    field: one(raw.field) === "name" ? "name" : "email",
    role: role === "admin" || role === "user" ? role : null,
    sort: SORT_FIELDS.includes(sort as UsersQuery["sort"])
      ? (sort as UsersQuery["sort"])
      : "createdAt",
    dir: one(raw.dir) === "asc" ? "asc" : "desc",
    page: Number.isInteger(page) && page > 0 ? page : 1,
    size: PAGE_SIZES.includes(size) ? size : PAGE_SIZES[0],
  };
}

export default async function UsersPage({ params, searchParams }: PageProps) {
  const [{ moderator }, raw] = await Promise.all([params, searchParams]);
  const query = parseQuery(raw);
  const basePath = `/${moderator}/users`;

  return (
    <div className="@container flex flex-col gap-6">
      <HeaderBar
        titleNode="Users"
        descriptionNode="Find accounts, check their access and open a user to manage it."
        actionNode={
          <ButtonLink href={`${basePath}/new`} variant="primary">
            <UserPlus aria-hidden="true" />
            Add user
          </ButtonLink>
        }
      />
      <UsersSearch />
      <Suspense
        key={JSON.stringify(query)}
        fallback={<UsersResultsSkeleton rows={query.size} />}
      >
        <UsersResults query={query} basePath={basePath} />
      </Suspense>
    </div>
  );
}
