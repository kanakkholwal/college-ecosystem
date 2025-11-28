import EmptyArea from "@/components/common/empty-area";
import { HeaderBar } from "@/components/common/header-bar";
import { DataTablePagination } from "@/components/extended/data-table-pagination"; // Ensure this path is correct
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ButtonLink } from "@/components/utils/link";
import { AlertCircle, UserPlus, Users } from "lucide-react";
import { headers } from "next/headers"; // <--- REQUIRED for Server Components
import { auth } from "~/auth"; // Server-side auth instance
import { columns } from "./columns";
import { UsersToolbar } from "./toolbar";

interface PageProps {
  searchParams: Promise<{
    searchValue?: string;
    searchField?: "name" | "email";
    searchOperator?: "contains" | "starts_with" | "ends_with";
    sortBy?: "createdAt" | "updatedAt";
    offset?: string;
    limit?: string;
    sortDirection?: string;
  }>;
}
type UserType = Awaited<
  ReturnType<typeof auth.api.listUsers>
>["users"][number];

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestHeaders = await headers(); 

  // 1. Parse Params with Defaults
  const limit = parseInt(params.limit || "10");
  const offset = parseInt(params.offset || "0");
  const searchValue = params.searchValue || "";
  const sortDirection = (params.sortDirection as "asc" | "desc") || "desc";
  const searchField = params.searchField || "name";
  const searchOperator = params.searchOperator || "contains";


  // 2. Fetch Data (Server Side)
  // We declare variables with types or rely on const to avoid "implicitly has 'any' type" errors
  let usersData: UserType[] = [];
  let totalCount = 0;
  let errorMessage: string | null = null;

  try {
    // auth.api.listUsers requires 'headers' to verify session/permissions
    const res = await auth.api.listUsers({
      headers: requestHeaders,
      query: {
        limit,
        offset,
        searchField: searchField,
        searchOperator: searchOperator,
        searchValue: searchValue,
        sortDirection,
        sortBy: params.sortBy || "createdAt",
      },
    });

    if (res.users) {
      // Verify if your auth.api.listUsers returns { users, count }
      // If it doesn't return count, fallback to users.length
      usersData = res.users;
      totalCount = res.total ?? res.users.length;
    } else {
      // If data is null, there is usually an error
      errorMessage = "Failed to fetch users.";
    }

  } catch (e: any) {
    // Catch network or unexpected errors
    errorMessage = e.message || "An unexpected error occurred.";
  }

  // 3. Error State
  if (errorMessage) {
    return (
      <EmptyArea
        icons={[AlertCircle]}
        title="Unable to load users"
        description={errorMessage}
      />
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 py-8 px-4 sm:px-6">

      {/* Header */}
      <HeaderBar
        Icon={Users}
        titleNode={
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Team & Users</h1>
            <Badge variant="default" className="rounded-full px-2.5">
              {totalCount} Total
            </Badge>
          </div>
        }
        descriptionNode="Manage system access, roles, and user profiles."
        actionNode={
          <ButtonLink href="/admin/users/new" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" /> Create User
          </ButtonLink>
        }
      />

      {/* Main Content */}
      <div className="space-y-4">
        <UsersToolbar />

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
          <DataTable
            data={usersData}
            columns={columns}
          />

          {/* Pagination Control */}
          <div className="border-t bg-muted/20">
            <DataTablePagination
              totalCount={totalCount}
              pageSize={limit}
              pageIndex={Math.floor(offset / limit)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}