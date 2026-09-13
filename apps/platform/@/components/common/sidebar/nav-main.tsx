"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useId, useState } from "react";

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

// Hick's law: longer groups fold the rest behind "Show more".
const MAX_VISIBLE_ITEMS = 7;

const isWithin = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export function NavMain({
  items,
  label,
  rootHref,
}: {
  items: NavItem[];
  /** Group heading. Omit for an unlabelled group. */
  label?: string;
  /** The dashboard root, which is only active on an exact match. */
  rootHref?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [showAll, setShowAll] = useState(false);
  const overflowId = useId();

  const hrefFor = (href: string, preserve?: boolean) => {
    if (!preserve || pathname !== href) return href;
    const query = searchParams.toString();
    return query ? `${href}?${query}` : href;
  };

  const activeFor = (item: NavItem) => {
    if (item.isActive) return true;
    if (item.href === rootHref) return pathname === item.href;
    return isWithin(pathname, item.href);
  };

  const overflowing = items.length > MAX_VISIBLE_ITEMS;
  const hiddenHasActive = items
    .slice(MAX_VISIBLE_ITEMS - 1)
    .some((item) => activeFor(item));
  const visible =
    overflowing && !showAll && !hiddenHasActive
      ? items.slice(0, MAX_VISIBLE_ITEMS - 1)
      : items;

  return (
    <SidebarGroup className="py-1">
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu id={overflowId}>
        {visible.map((item) => {
          const isActive = activeFor(item);
          const subItems = item.items ?? [];

          return (
            <Collapsible
              key={item.href}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <Link
                    href={hrefFor(item.href, item.preserveParams)}
                    aria-current={pathname === item.href ? "page" : undefined}
                    onClick={() => setOpenMobile(false)}
                  >
                    <item.icon aria-hidden="true" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>

                {subItems.length > 0 && (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight aria-hidden="true" />
                        <span className="sr-only">
                          Toggle {item.title} links
                        </span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                              >
                                <Link
                                  href={hrefFor(
                                    subItem.href,
                                    item.preserveParams
                                  )}
                                  aria-current={
                                    isSubActive ? "page" : undefined
                                  }
                                  onClick={() => setOpenMobile(false)}
                                >
                                  <span>{subItem.title}</span>
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

        {overflowing && !hiddenHasActive && (
          <SidebarMenuItem>
            <SidebarMenuButton
              aria-expanded={showAll}
              aria-controls={overflowId}
              tooltip={showAll ? "Show less" : "Show more"}
              onClick={() => setShowAll((open) => !open)}
            >
              <ChevronDown
                aria-hidden="true"
                className={showAll ? "rotate-180" : undefined}
              />
              <span>
                {showAll
                  ? "Show less"
                  : `Show ${items.length - (MAX_VISIBLE_ITEMS - 1)} more`}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
