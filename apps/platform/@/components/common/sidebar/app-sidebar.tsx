"use client";

import type * as React from "react";

import { NavMain } from "@/components/common/sidebar/nav-main";
import { NavUser } from "@/components/common/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { Session } from "~/auth/client";

import { ApplicationSvgLogo } from "@/components/logo";
import { getSideNavLinks } from "@/constants/links";
import { useCookieWithUtils } from "@/hooks/use-cookie";
import Link from "next/link";
import { useMemo } from "react";
import { appConfig, orgConfig } from "~/project.config";



interface SidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: Session["user"];
  moderator: string;
  prefixPath?: string; // Optional prefix path for links
}


export function AppSidebar({
  user,
  moderator,
  prefixPath,
  ...props
}: SidebarProps) {
  const { value } = useCookieWithUtils('hostel:slug');

  const links = useMemo(() => getSideNavLinks(moderator, prefixPath, value), [moderator, prefixPath, value]);

  return (
    <Sidebar collapsible="icon" className="border-r border-border" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              size="lg"
              asChild
            >
              <Link href={`/${prefixPath ? prefixPath : moderator}`}>
                <ApplicationSvgLogo className="!size-8" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {appConfig.name}
                  </span>
                  <span className="truncate text-xs">
                    {orgConfig.mailSuffix}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={links} />

      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

