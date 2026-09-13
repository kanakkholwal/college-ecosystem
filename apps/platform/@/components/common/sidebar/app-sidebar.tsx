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
import { appConfig } from "~/project.config";
import { changeCase } from "~/utils/string";

interface SidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: Session["user"];
  moderator: string;
  prefixPath?: string;
}

type SideNavLink = ReturnType<typeof getSideNavLinks>[number];

// Order is render order. Paths are relative to the dashboard root.
const SECTIONS: { label?: string; match: RegExp }[] = [
  { match: /^$/ },
  { label: "Administration", match: /^\/(users|result)(\/|$)/ },
  {
    label: "Academics",
    match: /^\/(courses|schedules|events|rooms|attendance-personal)(\/|$)/,
  },
  { label: "Hostel", match: /^\/(hostels|h|outpass)(\/|$)/ },
  { label: "Account", match: /^\/settings(\/|$)/ },
];

function groupLinks(links: SideNavLink[], root: string) {
  const groups = SECTIONS.map((section) => ({
    label: section.label,
    items: [] as SideNavLink[],
  }));
  const rest: SideNavLink[] = [];

  for (const link of links) {
    const relative = link.href.slice(root.length);
    const index = SECTIONS.findIndex((section) => section.match.test(relative));
    if (index === -1) rest.push(link);
    else groups[index].items.push(link);
  }
  // Keep Account last even when an unknown link lands in "More".
  const account = groups.pop();
  if (rest.length > 0) groups.push({ label: "More", items: rest });
  if (account) groups.push(account);

  return groups.filter((group) => group.items.length > 0);
}

export function AppSidebar({
  user,
  moderator,
  prefixPath,
  ...props
}: SidebarProps) {
  const { value } = useCookieWithUtils("hostel:slug");
  const root = `/${prefixPath ? prefixPath : moderator}`;

  const groups = useMemo(
    () => groupLinks(getSideNavLinks(moderator, prefixPath, value), root),
    [moderator, prefixPath, value, root]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={`${changeCase(moderator, "title")} dashboard`}
              className="hover:bg-transparent"
              asChild
            >
              <Link href={root}>
                <ApplicationSvgLogo className="size-8! shrink-0" />
                <span className="grid min-w-0 flex-1 text-left">
                  <span className="truncate text-body font-medium text-foreground">
                    {appConfig.name}
                  </span>
                  <span className="truncate text-caption text-muted-foreground">
                    {changeCase(moderator, "title")} dashboard
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label={`${changeCase(moderator, "title")} navigation`}>
          {groups.map((group) => (
            <NavMain
              key={group.label ?? "overview"}
              label={group.label}
              items={group.items}
              rootHref={root}
            />
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <NavUser user={user} moderator={moderator} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
