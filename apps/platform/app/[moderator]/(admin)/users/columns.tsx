"use client";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { ButtonLink } from "@/components/utils/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { authClient } from "~/auth/client";

export type UserType = Awaited<
  ReturnType<typeof authClient.admin.listUsers>
>["data"]["users"][number];

export const columns: ColumnDef<UserType>[] = [
  {
    id: "select",
    accessorKey: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium whitespace-nowrap">
          {row.getValue("name")}
        </div>
      );
    },

    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium whitespace-nowrap">
          {row.getValue("email")}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "emailVerified",
    accessorKey: "emailVerified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verified" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium whitespace-nowrap">
          <Badge
            variant={
              row.getValue("emailVerified")
                ? "success_light"
                : "destructive_light"
            }
          >
            {row.getValue("emailVerified") ? "Yes" : "No"}
          </Badge>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "gender",
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium whitespace-nowrap">
          {row.getValue("gender")}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "other_roles",
    accessorKey: "other_roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Roles" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium whitespace-nowrap">
          {(row.original as UserType)?.other_roles?.join(", ")}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
    enableGrouping: true,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const formatted = new Date(row.getValue("createdAt")).toLocaleDateString(
        "en-IN",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      return (
        <div className="text-left font-medium whitespace-nowrap">
          {formatted}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "updatedAt",
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      const formatted = new Date(row.getValue("updatedAt")).toLocaleDateString(
        "en-IN",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      return (
        <div className="text-left font-medium whitespace-nowrap">
          {formatted}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    accessorKey: "actions",
    header: "Actions",
    enableSorting: false,
    enableHiding: true,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium whitespace-nowrap">
          <ButtonLink variant="link" href={`/admin/users/${row.original.id}`}>
            View user
          </ButtonLink>
        </div>
      );
    },
  },
];
