"use client";

import BaseSearchBox from "@/components/application/base-search";
import type { FilterOption } from "@/components/application/filter-panel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Ellipsis, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";

const FILTERS: FilterOption[] = [
  {
    key: "field",
    label: "Search in",
    values: [
      { value: "email", label: "Email" },
      { value: "name", label: "Name" },
    ],
  },
  {
    key: "role",
    label: "Primary role",
    values: [
      { value: "admin", label: "Admin" },
      { value: "user", label: "User" },
    ],
  },
];

export function UsersSearch() {
  const searchParams = useSearchParams();
  const byName = searchParams.get("field") === "name";
  return (
    <BaseSearchBox
      id="users-search"
      searchPlaceholder={byName ? "Search by name" : "Search by email"}
      filterOptions={FILTERS}
      filterDialogTitle="Filter users"
      filterDialogDescription="Choose what the search matches and narrow by role."
      className="max-w-none"
    />
  );
}

export function PageSizeSelect({
  value,
  sizes,
}: {
  value: number;
  sizes: readonly number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="users-page-size"
        className="text-body text-muted-foreground"
      >
        Rows
      </label>
      <Select
        value={String(value)}
        disabled={pending}
        onValueChange={(next) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("size", next);
          params.delete("page");
          startTransition(() => router.replace(`${pathname}?${params}`));
        }}
      >
        <SelectTrigger id="users-page-size" className="h-9 w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`);
  } catch {
    toast.error(`Couldn't copy the ${what.toLowerCase()}`);
  }
}

export function UserRowActions({
  id,
  name,
  email,
  href,
}: {
  id: string;
  name: string;
  email: string;
  href: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon_sm"
          aria-label={`Actions for ${name}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <Ellipsis aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild className="cursor-pointer gap-2">
          <Link href={href}>
            <UserRound className="size-4" aria-hidden="true" />
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onSelect={() => copy(email, "Email")}
        >
          <Mail className="size-4" aria-hidden="true" />
          Copy email
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onSelect={() => copy(id, "User ID")}
        >
          <Copy className="size-4" aria-hidden="true" />
          Copy user ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
