"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table"; // Ensure you have this helper or use standard header
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import type { OutPassType } from "~/models/hostel_n_outpass";

// Helper for Status Styling
const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
        case "approved":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200/50";
        case "rejected":
            return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200/50";
        case "pending":
            return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200/50";
        case "completed":
        case "returned":
            return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200/50";
        default:
            return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200";
    }
};

export const columns: ColumnDef<OutPassType>[] = [
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
    id: "student", // Combined Name and Roll for better UX
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => {
      const name = row.original.student.name;
      const roll = row.original.student.rollNumber;
      
      return (
        <div className="flex items-center gap-3 py-1">
            <Avatar className="h-9 w-9 border">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`} />
                <AvatarFallback className="text-xs font-medium">{name?.slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground/90 leading-none">{name}</span>
                <span className="text-xs text-muted-foreground font-mono mt-1">{roll}</span>
            </div>
        </div>
      );
    },
  },
  {
    accessorKey: "roomNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Room" />
    ),
    cell: ({ row }) => {
        return (
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 opacity-70" />
                <span className="font-medium text-sm text-foreground">{row.original.roomNumber}</span>
            </div>
        )
    },
  },
  {
    accessorKey: "reason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Purpose" />
    ),
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string;
      return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <div className="max-w-[200px] truncate font-medium text-sm text-foreground/80 cursor-default">
                        {reason}
                     </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{reason}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status as string;
      return (
        <Badge 
            variant="outline" 
            className={cn("capitalize px-2.5 py-0.5 shadow-none border font-medium", getStatusStyles(status))}
        >
            {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 opacity-50" />
            <span className="text-xs font-medium">
                {date.toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric"
                })}
            </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                <Link href={`outpass-logs/${row.original.student._id}`}>
                    <span className="sr-only">View Details</span>
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </Button>
        </div>
      );
    },
  },
];