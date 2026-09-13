"use client";

import {
  Check,
  ChevronsUpDown,
  Globe,
  LayoutGrid,
  UserRound,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "~/auth/client";
import { ALLOWED_ROLES } from "~/constants";
import { changeCase } from "~/utils/string";

/** Workspace switcher: the current role, the user's other dashboards, and a way back to the site. */
export function NavUser({
  user,
  moderator,
}: {
  user: Session["user"];
  moderator?: string;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const current = moderator || pathname.split("/")[1] || user.role;

  const workspaces = [user.role, ...(user.other_roles ?? [])].filter(
    (role, index, all) =>
      (ALLOWED_ROLES as readonly string[]).includes(role) &&
      all.indexOf(role) === index
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={`${changeCase(current, "title")} workspace`}
              className="data-[state=open]:bg-sidebar-accent"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-background text-primary">
                <LayoutGrid className="size-4" aria-hidden="true" />
              </span>
              <span className="grid min-w-0 flex-1 text-left">
                <span className="truncate text-body font-medium text-foreground">
                  {changeCase(current, "title")}
                </span>
                <span className="truncate text-caption text-muted-foreground">
                  {user.name}
                </span>
              </span>
              <ChevronsUpDown
                className="ml-auto size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl"
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="text-caption font-medium text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {workspaces.map((role) => (
                <DropdownMenuItem key={role} asChild>
                  <Link
                    href={`/${role}`}
                    aria-current={role === current ? "page" : undefined}
                    onClick={() => setOpenMobile(false)}
                    className="h-9 gap-2"
                  >
                    <LayoutGrid
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">
                      {changeCase(role, "title")}
                    </span>
                    {role === current && (
                      <>
                        <Check
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        <span className="sr-only">(current)</span>
                      </>
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={`/u/${user.username}`} className="h-9 gap-2">
                  <UserRound
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Public profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" className="h-9 gap-2">
                  <Globe
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Back to site
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
