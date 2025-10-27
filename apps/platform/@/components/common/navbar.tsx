"use client";
import ProfileDropdown from "@/components/common/profile-dropdown";
import { ApplicationInfo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { AuthButtonLink, ButtonLink } from "@/components/utils/link";
import {
  NavLink,
  SUPPORT_LINKS,
  getNavLinks,
  socials,
} from "@/constants/links";
import { cn } from "@/lib/utils";
import { ArrowUpRight, LayoutDashboard, LogIn, Search, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import type { Session } from "~/auth";
import { NavTabs } from "./nav-tabs";
import { ThemePopover, ThemeSwitcher } from "./theme-switcher";

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
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo } from "react";
import { twUtility } from "../utils/tailwind-classes";

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
  const pathname = usePathname();
  const navLinks = getNavLinks(user);

  // Memoized categories and category map
  const { categories } = useMemo(() => {
    const cats = ["all", ...new Set(navLinks.map((l) => l.category).filter(Boolean))];
    const map = new Map<string, string[]>();
    cats.forEach((c) =>
      map.set(
        c,
        navLinks.filter((l) => c === "all" || l.category === c).map((l) => l.href)
      )
    );
    return { categories: cats, categoryMap: map };
  }, [navLinks]);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const availableLinks = useMemo(
    () =>
      navLinks.filter(
        (link) => activeCategory === "all" || link.category === activeCategory
      ),
    [activeCategory, navLinks]
  );

  return (
    <header
      id="navbar"
      className={cn(
        "z-50 w-full pb-2 transition-all",
        "bg-card/25 backdrop-blur-lg border-b"
      )}
    >
      <div className="w-full max-w-(--max-app-width) mx-auto flex items-center justify-between px-4 py-2">
        <Link href="/">
          <ApplicationInfo />
        </Link>
        <div className="ml-auto flex gap-2 items-center">
          <QuickLinks user={user} publicLinks={navLinks} />
          <ThemeSwitcher />
          <ThemePopover className="hidden md:inline-flex"/>
          {user ? (
            <ProfileDropdown user={user} />
          ) : (
            <AuthButtonLink
              size="sm"
              rounded="full"
              href={pathname}
              variant="rainbow"
            >
              Log In
              <LogIn />
            </AuthButtonLink>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className={cn("w-full max-w-(--max-app-width) mx-auto pr-3")}>
        {categories.length > 1 && (
          <div className={cn("inline-flex items-center space-x-2 text-sm mx-2 lg:mx-4 mb-2 max-w-full",twUtility.horizontalScroll)}>
            {categories.map((category, index) => (
              <Fragment key={category}>
                <button
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "h-6 px-3 py-2 cursor-pointer transition-colors text-xs font-medium capitalize",
                    "text-muted-foreground hover:text-primary hover:bg-primary/10 hover:dark:bg-primary/30 rounded-lg",
                    "inline-flex items-center justify-center relative",
                    activeCategory === category && "text-primary"
                  )}
                >
                  {category}
                  <AnimatePresence>
                    {activeCategory === category && (
                      <motion.div
                        layoutId="active-category-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.25 bg-primary rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </AnimatePresence>
                </button>
                {index < categories.length - 1 && (
                  <Separator orientation="vertical" />
                )}
              </Fragment>
            ))}
          </div>
        )}

        {/* Nav Tabs */}
        <NavTabs
          key={activeCategory} // Key to remount on category change
          navLinks={availableLinks.map((link) => ({
            id: link.href,
            href: link.href,
            children: (
              <>
                {link.Icon && <link.Icon className="size-4" />}
                {link.title}
              </>
            ),
            isNew: link.isNew,
            
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
