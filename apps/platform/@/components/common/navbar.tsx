"use client";
import ProfileDropdown from "@/components/common/profile-dropdown";
import { ApplicationInfo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/utils/link";
import {
  NavLink,
  SUPPORT_LINKS,
  getNavLinks,
  socials,
} from "@/constants/links";
import { cn } from "@/lib/utils";
import { ArrowUpRight, LayoutDashboard, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Session } from "~/auth";
import { NavTabs } from "./nav-tabs";
import { ThemePopover, ThemeSwitcher } from "./theme-switcher";

import { Search, Settings, User } from "lucide-react";

import { Icon } from "@/components/icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import React from "react";

const loggedInList = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/dashboard/settings",
    title: "Settings",
    icon: Settings,
  },
];

interface NavbarProps {
  user?: Session["user"];
}

export default function Navbar({ user }: NavbarProps) {
  const navLinks = getNavLinks(user);
  const pathname = usePathname();

  return (
    <header
      id="navbar"
      className={cn("z-50 w-full pb-2 transition-all", "bg-card/25 backdrop-blur-lg border-b")}
    >
      <div className="w-full max-w-(--max-app-width) mx-auto flex items-center justify-between px-4 py-2">
        <Link href="/">
          <ApplicationInfo />
        </Link>
        <div className="ml-auto flex gap-2 items-center">
          <QuickLinks user={user} publicLinks={navLinks} />
          <ThemeSwitcher />
          <ThemePopover />
          {user ? (
            <ProfileDropdown user={user} />
          ) : (
            <ButtonLink
              size="sm"
              rounded="full"
              href={`/auth/sign-in?next=${pathname}`}
              variant="rainbow"
            >
              Log In
              <LogIn />
            </ButtonLink>
          )}
        </div>
      </div>
      <div className="w-full max-w-(--max-app-width) mx-auto">
        <NavTabs
          navLinks={navLinks.map((link) => ({
            id: link.href,
            href: link.href,
            children: (
              <>
                {link.Icon && <link.Icon className="size-4" />}
                {link.title}
              </>
            ),
            items: link.items,
          }))}
        />
      </div>
    </header>
  );
}

interface QuickLinksProps extends NavbarProps {
  publicLinks: NavLink[];
}
export function QuickLinks({ user, publicLinks }: QuickLinksProps) {
  const [open, setOpen] = useState(false);

  const isLoggedIn = !!user;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        aria-label="Search for anything (Ctrl + J)"
        role="button"
        onClick={() => setOpen(!open)}
        title="Search for anything (Ctrl + J)"
        aria-labelledby="search"
        size="icon_sm"
        variant="outline"
        rounded="full"
      >
        <Search />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {publicLinks.map((item, index) => {
              return (
                <CommandItem key={`command-item-${index}`} asChild>
                  <Link
                    href={item.href}
                    className="flex items-center w-full flex-wrap cursor-pointer group"
                  >
                    {item.Icon && <item.Icon className="size-3 mr-2" />}
                    <span>
                      <span className="text-sm">{item.title}</span>
                      <span className="block text-xs opacity-75 w-full">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </CommandItem>
              );
            })}
            {!isLoggedIn && (
              <CommandItem>
                <Link
                  href={`/auth/sign-in`}
                  className="flex items-center w-full"
                >
                  <LogIn className="size-3 mr-3" />
                  <span>
                    <span className="text-sm">Sign In</span>
                    <span className="block text-xs  opacity-75 w-full">
                      Sign in to your account
                    </span>
                  </span>
                </Link>
              </CommandItem>
            )}
          </CommandGroup>
          <CommandSeparator />
          {isLoggedIn && (
            <CommandGroup heading="Go To">
              <CommandItem>
                <Link
                  href={`/u/` + user?.username!}
                  className="flex items-center  w-full"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Your Profile</span>
                </Link>
              </CommandItem>
              {loggedInList.map((item, index) => {
                return (
                  <CommandItem key={`command-item-${index}`}>
                    <Link href={item.path} className="flex items-center w-full">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function SocialBar({ className }: { className?: string }) {
  if (socials.length === 0) {
    return null;
  }
  return (
    <div
      className={cn(
        "inline-flex flex-row items-center empty:hidden gap-3 mx-auto",
        className
      )}
    >
      {socials.map((link) => {
        return (
          <Link
            href={link.href}
            target="_blank"
            key={link.href}
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 p-1.5 [&_svg]:size-5 size-8 icon text-muted-foreground md:[&_svg]:size-4.5",
              "hover:bg-muted hover:text-primary hover:-translate-y-1 ease-in transition-all duration-300 flex justify-center items-center"
            )}
          >
            <link.icon />
          </Link>
        );
      })}
    </div>
  );
}

export function SupportBar() {
  return (
    <div className="inline-flex flex-wrap items-center empty:hidden gap-2 justify-center md:justify-start">
      {SUPPORT_LINKS.map((link) => {
        return (
          <Link
            href={link.href}
            target="_blank"
            key={link.href}
            className={cn(
              "group inline-flex items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary [&_svg]:size-4 text-xs font-medium"
            )}
          >
            {link.title}
            <ArrowUpRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        );
      })}
    </div>
  );
}

export function GoToTopButton({ className }: { className?: string }) {
  return (
    <ButtonLink
      role="anchor"
      href="#navbar"
      title="Go to top"
      variant="ghost"
      transition="damped"
      size="sm"
      className={cn(className)}
    >
      Go to Top
      <Icon name="arrow-up" />
    </ButtonLink>
  );
}
