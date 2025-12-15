"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import type { OutPassType } from "~/models/hostel_n_outpass";

const timeOptions: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  hour12: true,
  minute: "2-digit",
};

export const columns: ColumnDef<OutPassType>[] = [
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
        <div className="text-left font-medium">{row.original.student.name}</div>
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
        <div className="text-left font-medium">
          {row.original.student.email}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "InTime",
    accessorKey: "InTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="InTime" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">
          {new Date(row.original.expectedInTime).toLocaleDateString(
            "en-IN",
            timeOptions
          )}
          {row.original.actualInTime &&
            new Date(row.original.actualInTime).toLocaleDateString(
              "en-IN",
              timeOptions
            )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "OutTime",
    accessorKey: "OutTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="OutTime" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">
          {new Date(row.original.expectedOutTime).toLocaleDateString(
            "en-IN",
            timeOptions
          )}
          {row.original?.actualInTime &&
            new Date(row.original?.actualOutTime || "").toLocaleDateString(
              "en-IN",
              timeOptions
            )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">
          <Badge
            variant={
              row.getValue("status") === "pending"
                ? "warning_soft"
                : row.getValue("status") === "approved"
                  ? "success_soft"
                  : row.getValue("status") === "rejected"
                    ? "destructive_soft"
                    : "default_soft"
            }
          >
            {row.getValue("status")}
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
        <div className="text-left font-medium">{row.getValue("gender")}</div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "validTill",
    accessorKey: "validTill",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="validTill" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">
          {new Date(row.original.validTill).toLocaleDateString(
            "en-IN",
            timeOptions
          )}
        </div>
      );
    },
    enableHiding: true,
    enableGrouping: true,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requested" />
    ),
    cell: ({ row }) => {
      const formatted = new Date(row.getValue("createdAt")).toLocaleDateString(
        "en-IN",
        timeOptions
      );
      return (
        <div className="text-left font-medium">
          {formatted}(
          {formatDistanceToNow(new Date(row.getValue("createdAt")), {
            addSuffix: true,
          })}
          )
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
        <div className="text-left font-medium">
          <Button variant="link">Take Action</Button>
        </div>
      );
    },
  },
];
