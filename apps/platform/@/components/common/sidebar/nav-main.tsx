"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/extended/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { getWindowOrigin } from "@/lib/env";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    href: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    isActive?: boolean;
    preserveParams?: boolean;
    items?: {
      title: string;
      href: string;
    }[];
  }[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return (
    <SidebarGroup className="shrink-0 max-h-max">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const url = new URL(item.href, getWindowOrigin());
          if (item?.preserveParams && pathname === item.href)
            url.search = searchParams.toString();

          return (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link href={url.toString()}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          // combine search params with the item.href and subItem.href to create a new URL
                          const url = new URL(subItem.href, getWindowOrigin());
                          if (item?.preserveParams && pathname === item.href) {
                            // if the item is active, preserve the search params
                            const preservedParams = new URLSearchParams(
                              searchParams.toString()
                            );
                            // remove any existing params that are not in the subItem.href
                            for (const key of searchParams.keys()) {
                              const value = preservedParams.get(key);
                              if (value !== null)
                                url.searchParams.set(key, value.toString());
                            }
                          }
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={url.toString()}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
