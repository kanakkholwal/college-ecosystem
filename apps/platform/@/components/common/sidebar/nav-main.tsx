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
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  isActive?: boolean;
  preserveParams?: boolean;
  items?: {
    title: string;
    href: string;
  }[];
}

export function NavMain({ items }: { items: NavItem[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Helper to construct URLs with preserved params
  const constructUrl = useCallback((href: string, preserve: boolean | undefined) => {
    try {
      const url = new URL(href, getWindowOrigin());
      if (preserve && pathname === href) {
        const current = new URLSearchParams(searchParams.toString());
        // Merge params logic here if needed, or just append
        url.search = current.toString();
      }
      return url.toString();
    } catch (e) {
      return href;
    }
  }, [pathname, searchParams]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item,idx) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isMainActive = item.isActive || (pathname.startsWith(item.href) && idx !== 0);

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isMainActive}
                  className={cn(
                    "transition-all duration-200",
                    isMainActive && "font-medium text-primary bg-primary/5"
                  )}
                >
                  <Link href={constructUrl(item.href, item.preserveParams)}>
                    <item.icon className={cn(
                        "size-4 transition-colors",
                        isMainActive ? "text-primary" : "text-muted-foreground group-hover/collapsible:text-foreground"
                    )} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                
                {hasSubItems && (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90 transition-transform duration-200 text-muted-foreground hover:text-foreground">
                        <ChevronRight className="size-3" />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="border-l-border/50 ml-3.5">
                        {item.items?.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                                className={cn(
                                  "text-xs transition-colors",
                                  isSubActive ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                <Link href={constructUrl(subItem.href, item.preserveParams)}>
                                  {subItem.title}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}