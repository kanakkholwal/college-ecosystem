"use client";

import { ButtonLink } from "@/components/utils/link";
import { ChevronLeft, Palette, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./sidenav";

const NAV_ITEMS = [
  {
    title: "Account",
    href: "account",
    description: "Gender, linked emails and password",
    icon: UserRound,
  },
  {
    title: "Appearance",
    href: "appearance",
    description: "Light or dark mode and accent colour",
    icon: Palette,
  },
];

const itemsFor = (basePath: string) =>
  NAV_ITEMS.map((item) => ({ ...item, href: `${basePath}/${item.href}` }));

/** Desktop side nav. On mobile it becomes a back link on section pages. */
export function SettingsNav({ basePath }: { basePath: string }) {
  const pathname = usePathname();
  const onIndex = pathname === basePath;

  return (
    <>
      <SidebarNav items={itemsFor(basePath)} className="hidden md:block" />
      {!onIndex && (
        <ButtonLink
          href={basePath}
          variant="ghost"
          size="sm"
          className="-ml-3 w-fit text-muted-foreground md:hidden"
        >
          <ChevronLeft aria-hidden="true" />
          All settings
        </ButtonLink>
      )}
    </>
  );
}

export function SettingsList({ basePath }: { basePath: string }) {
  return <SidebarNav items={itemsFor(basePath)} variant="list" />;
}
