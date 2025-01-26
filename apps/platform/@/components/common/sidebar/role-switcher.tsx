"use client";

import { ChevronsUpDown } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Session } from "~/lib/auth-client";

export function RoleSwitcher({ user }: { user: Session["user"] }) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex items-center justify-center rounded-lg text-3xl font-bold text-center relative bg-linear-to-r from-primary to-sky-500 bg-clip-text text-transparent hover:from-sky-500 hover:to-primary whitespace-nowrap">
            N
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {process.env.NEXT_PUBLIC_WEBSITE_NAME}
            </span>
            {/* <span className="truncate text-xs">{activeRole.role}</span> */}
          </div>
          <ChevronsUpDown className="ml-auto hidden" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
