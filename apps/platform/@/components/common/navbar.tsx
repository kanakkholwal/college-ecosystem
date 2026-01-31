"use client";

import ProfileDropdown from "@/components/common/profile-dropdown";
import { Icon } from "@/components/icons";
import { ApplicationInfo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { AuthButtonLink } from "@/components/utils/link";
import {
  NavLink,
  SUPPORT_LINKS,
  getNavLinks,
  socials,
} from "@/constants/links";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogIn,
  Search,
  Settings,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";
import type { Session } from "~/auth";
import { twUtility } from "../utils/tailwind-classes";
import { NavTabs } from "./nav-tabs";
import { ThemePopover, ThemeSwitcher } from "./theme-switcher";

const loggedInList = [
  { path: "/dashboard", title: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/settings", title: "Settings", icon: Settings },
];

interface NavbarProps {
  user?: Session["user"];
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const navLinks = getNavLinks(user);

  // Memoized categories logic
  const { categories } = useMemo(() => {
    const cats = ["all", ...new Set(navLinks.map((l) => l.category).filter(Boolean))];
    return { categories: cats };
  }, [navLinks]);

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const availableLinks = useMemo(
    () => navLinks.filter((link) => activeCategory === "all" || link.category === activeCategory),
    [activeCategory, navLinks]
  );

  return (
    <header
      id="navbar"
      className={cn(
        "z-50 w-full transition-all duration-300",
        "bg-background/80 backdrop-blur-xl border-b border-border/40 supports-backdrop-filter:bg-background/60"
      )}
    >
      <div className="w-full max-w-(--max-app-width) mx-auto">

        <div className="flex items-center justify-between px-4 py-3 h-16">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <ApplicationInfo />
          </Link>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <QuickLinks user={user} publicLinks={navLinks} />

            <div className="h-6 w-px bg-border/50 hidden sm:block mx-1" />

            <ThemeSwitcher />
            <ThemePopover className="hidden md:inline-flex" />

            {user ? (
              <ProfileDropdown user={user} />
            ) : (
              <AuthButtonLink
                size="sm"
                href={pathname}
                variant="rainbow"
                className="font-medium px-5"
              >
                Log In
              </AuthButtonLink>
            )}
          </div>
        </div>

        <div className="px-4 pb-0">
          <div className="flex flex-col gap-2">

            {categories.length > 1 && (
              <div className={cn("flex items-center gap-1 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 mask-fade-sides", twUtility.horizontalScroll)}>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "relative px-3 py-1.5 text-xs font-medium capitalize transition-colors rounded-md whitespace-nowrap",
                      activeCategory === category
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {category}
                    {activeCategory === category && (
                      <motion.div
                        layoutId="navbar-category-pill"
                        className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Navigation Tabs */}
            <div className="pt-1 pb-1">
              <NavTabs
                key={activeCategory}
                navLinks={availableLinks.map((link) => ({
                  id: link.href,
                  href: link.href,
                  children: (
                    <span className="flex items-center gap-2">
                      {link.Icon && <link.Icon className="size-3.5 opacity-70" />}
                      {link.title}
                    </span>
                  ),
                  isNew: link.isNew,
                  items: link.items,
                }))}
              />
            </div>
          </div>
        </div>
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

  // Handle Ctrl/Cmd + K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center w-56 h-9 px-3 rounded-lg border border-border/50 bg-card/80 hover:bg-card dark:bg-muted/50 dark:hover:bg-muted/80 hover:border-border transition-all text-sm text-muted-foreground group"
      >
        <Search className="size-3.5 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Button
        onClick={() => setOpen(true)}
        size="icon_sm"
        variant="ghost"
        className="md:hidden text-muted-foreground"
      >
        <Search className="size-5" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search Ecosystem" description="Search through the college ecosystem">
        <CommandInput placeholder="Type to search ecosystem..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Suggestions">
            {publicLinks.map((item, index) => (
              <CommandItem key={`cmd-${index}`} asChild>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center">
                    {item.Icon ? <item.Icon className="mr-3 size-4 text-muted-foreground group-hover:text-primary transition-colors" /> : <ArrowUpRight className="mr-3 size-4" />}
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      {item.description && <span className="text-xs text-muted-foreground font-normal line-clamp-1">{item.description}</span>}
                    </div>
                  </div>
                  <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-50 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="my-2" />

          {isLoggedIn ? (
            <CommandGroup heading="Account">
              <CommandItem onSelect={() => setOpen(false)}>
                <Link href={`/u/${user.username}`} className="flex items-center w-full">
                  <User className="mr-2 size-4" /> Profile
                </Link>
              </CommandItem>
              {loggedInList.map((item, i) => (
                <CommandItem key={i} onSelect={() => setOpen(false)}>
                  <Link href={item.path} className="flex items-center w-full">
                    <item.icon className="mr-2 size-4" /> {item.title}
                  </Link>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : (
            <CommandGroup heading="Authentication">
              <CommandItem onSelect={() => setOpen(false)}>
                <Link href="/auth/sign-in" className="flex items-center w-full">
                  <LogIn className="mr-2 size-4" /> Sign In
                </Link>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

// --- UTILITY COMPONENTS ---

export function SocialBar({ className }: { className?: string }) {
  if (socials.length === 0) return null;
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {socials.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          target="_blank"
          className={cn(
            "flex items-center justify-center size-8 rounded-full text-muted-foreground transition-all",
            "hover:bg-primary/10 hover:text-primary hover:scale-105"
          )}
        >
          <link.icon className="size-4" />
        </Link>
      ))}
    </div>
  );
}

export function SupportBar() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {SUPPORT_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          {link.title}
          <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}
export function GoToTopButton({ className }: { className?: string }) {
  const handleClick = () => {
    window?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("text-xs text-muted-foreground hover:text-foreground", className)}
      onClick={handleClick}
    >
      Back to Top <Icon name="arrow-up" />
    </Button>
  );
}