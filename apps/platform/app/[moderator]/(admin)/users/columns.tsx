"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, MoreHorizontal, ShieldAlert, ShieldCheck, User } from "lucide-react";
import toast from "react-hot-toast";
import type { authClient } from "~/auth/client";

// Re-defining for scope, assuming imported from your auth client
export type UserType = Awaited<
  ReturnType<typeof authClient.admin.listUsers>
>["data"]["users"][number];

export const columns: ColumnDef<UserType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const name = row.original.name;
      const email = row.original.email;
      
      return (
        <div className="flex items-center gap-3 py-1">
            <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={row.original.image || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`} />
                <AvatarFallback className="font-medium text-xs">
                    {name?.slice(0,2).toUpperCase() || "U"}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-[140px]">
                <span className="text-sm font-semibold text-foreground truncate">{name || "Unnamed User"}</span>
                <span className="text-xs text-muted-foreground truncate font-normal">{email}</span>
            </div>
        </div>
      );
    },
  },
  {
    accessorKey: "emailVerified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verification" />
    ),
    cell: ({ row }) => {
      const isVerified = row.getValue("emailVerified");
      return (
        <Badge 
            variant={isVerified ? "outline" : "default"} 
            className={cn(
                "gap-1.5 font-normal",
                isVerified 
                  ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900" 
                  : "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20"
            )}
        >
            {isVerified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
            {isVerified ? "Verified" : "Unverified"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "role", // Assuming 'role' or 'other_roles' is where permissions live
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      // Logic to determine primary role display
      const roles = (row.original as any).other_roles || [];
      const primaryRole = (row.original as any).role || roles[0] || "user";

      return (
        <div className="flex items-center gap-1">
           <Badge variant="default" className="capitalize font-mono text-[10px] px-1.5">
              {primaryRole}
           </Badge>
           {roles.length > 0 && (
              <span className="text-[10px] text-muted-foreground">+{roles.length}</span>
           )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(row.getValue("createdAt")).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex justify-end">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => {
                    navigator.clipboard.writeText(user.id);
                    toast.success("ID copied");
                }}>
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <ButtonLink href={`/admin/users/${user.id}`} variant="ghost" size="sm" className="w-full justify-start px-2 h-8 font-normal">
                       <User className="mr-2 h-3.5 w-3.5" /> View Profile
                    </ButtonLink>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];