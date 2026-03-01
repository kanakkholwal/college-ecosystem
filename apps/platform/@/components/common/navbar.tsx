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
  CornerDownLeftIcon,
  LayoutDashboard,
  LogIn,
  Search,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    const cats = [
      "all",
      ...new Set(navLinks.map((l) => l.category).filter(Boolean)),
    ];
    return { categories: cats };
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
        "z-50 w-full transition-all duration-300",
        "bg-background/40 backdrop-blur-xl border-b border-border/40 supports-backdrop-filter:bg-background/30"
      )}
    >
      <div className="w-full max-w-(--max-app-width) mx-auto">
        <div className="flex items-center justify-between px-4 py-3 h-16">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
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
              <div
                className={cn(
                  "flex items-center gap-1 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 mask-fade-sides",
                  twUtility.horizontalScroll
                )}
              >
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
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
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
                      {link.Icon && (
                        <link.Icon className="size-3.5 opacity-70" />
                      )}
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
  const { push } = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<
    "page" | "account" | null
  >(null);
  const isLoggedIn = !!user;

  // Filter links based on search
  const filteredPublicLinks = useMemo(() => {
    if (!search) return publicLinks;
    const query = search.toLowerCase();
    return publicLinks.filter(
      (link) =>
        link.title.toLowerCase().includes(query) ||
        link.description?.toLowerCase().includes(query) ||
        link.category?.toLowerCase().includes(query)
    );
  }, [search, publicLinks]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch("");
      setSelectedType(null);
    }
  };

  const runCommand = React.useCallback((command: () => unknown) => {
    handleOpenChange(false);
    command();
  }, []);

  // Handle Ctrl/Cmd + K and /
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const pagesSection = useMemo(() => {
    if (filteredPublicLinks.length === 0) return null;

    return (
      <CommandGroup
        heading="Pages"
        className="p-0! **:[[cmdk-group-heading]]:scroll-mt-16 **:[[cmdk-group-heading]]:p-3! **:[[cmdk-group-heading]]:pb-1!"
      >
        {filteredPublicLinks.map((item, index) => (
          <CommandMenuItemComponent
            key={`page-${index}`}
            value={`${item.title} ${item.category || ""}`}
            keywords={item.category ? [item.category] : []}
            onHighlight={() => setSelectedType("page")}
            onSelect={() => {
              runCommand(() => push(item.href));
            }}
          >
            {item.Icon ? (
              <item.Icon className="size-5 opacity-70" />
            ) : (
              <ArrowUpRight className="size-5 opacity-70" />
            )}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium">{item.title}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground font-normal line-clamp-1">
                  {item.description}
                </span>
              )}
            </div>
          </CommandMenuItemComponent>
        ))}
      </CommandGroup>
    );
  }, [filteredPublicLinks, runCommand, push]);

  const accountSection = useMemo(() => {
    if (!isLoggedIn) {
      return (
        <CommandGroup
          heading="Authentication"
          className="p-0! **:[[cmdk-group-heading]]:p-3!"
        >
          <CommandMenuItemComponent
            value="Sign In"
            keywords={["auth", "login"]}
            onHighlight={() => setSelectedType("account")}
            onSelect={() => {
              runCommand(() => push("/auth/sign-in"));
            }}
          >
            <LogIn className="size-4" />
            <span>Sign In</span>
          </CommandMenuItemComponent>
        </CommandGroup>
      );
    }

    return (
      <CommandGroup
        heading="Account"
        className="p-0! **:[[cmdk-group-heading]]:p-3!"
      >
        <CommandMenuItemComponent
          value={`Profile ${user.username}`}
          keywords={["profile", "user"]}
          onHighlight={() => setSelectedType("account")}
          onSelect={() => {
            runCommand(() => push(`/u/${user.username}`));
          }}
        >
          <User className="size-4" />
          <span>View Profile</span>
        </CommandMenuItemComponent>

        {loggedInList.map((item) => (
          <CommandMenuItemComponent
            key={item.path}
            value={item.title}
            keywords={["account", "settings"]}
            onHighlight={() => setSelectedType("account")}
            onSelect={() => {
              runCommand(() => push(item.path));
            }}
          >
            <item.icon className="size-4" />
            <span>{item.title}</span>
          </CommandMenuItemComponent>
        ))}
      </CommandGroup>
    );
  }, [isLoggedIn, user, runCommand, push]);

  return (
    <>
      {/* Desktop Search Button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center w-56 h-9 px-3 rounded-lg border border-border/80 bg-card/80 hover:bg-card hover:border-border transition-all text-sm text-muted-foreground group"
      >
        <Search className="size-3.5 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Mobile Search Button */}
      <Button
        onClick={() => setOpen(true)}
        size="icon_sm"
        variant="ghost"
        className="md:hidden text-muted-foreground"
      >
        <Search className="size-5" />
      </Button>

      {/* Command Dialog */}
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search Ecosystem"
        description="Search pages, navigate settings, and more"
        showCloseButton={false}
      >
        <CommandInput
          placeholder="Search ecosystem..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="no-scrollbar min-h-64">
          <CommandEmpty>
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {search
                  ? `No results found for "${search}"`
                  : "Start typing to search"}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Search for pages, commands, and more
              </p>
            </div>
          </CommandEmpty>

          {pagesSection}

          {pagesSection && accountSection && (
            <CommandSeparator className="my-2" />
          )}

          {accountSection}
        </CommandList>

        {/* Footer with Keyboard Hints */}
        <div className="text-muted-foreground absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-3 rounded-b-lg border-t border-border/40 bg-muted/30 px-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <CommandMenuKbd>
              <CornerDownLeftIcon className="size-3" />
            </CommandMenuKbd>
            <span>Select</span>
          </div>
          <div className="h-4 w-px bg-border/50" />
          <div className="flex items-center gap-2">
            <CommandMenuKbd>↑↓</CommandMenuKbd>
            <span>Navigate</span>
          </div>
          <div className="h-4 w-px bg-border/50" />
          <div className="flex items-center gap-2">
            <CommandMenuKbd>Esc</CommandMenuKbd>
            <span>Close</span>
          </div>
        </div>
      </CommandDialog>
    </>
  );
}

// Custom Command Menu Item with highlight callback
function CommandMenuItemComponent({
  children,
  className,
  onHighlight,
  ...props
}: React.ComponentProps<typeof CommandItem> & {
  onHighlight?: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "aria-selected" &&
          ref.current?.getAttribute("aria-selected") === "true"
        ) {
          onHighlight?.();
        }
      });
    });

    if (ref.current) {
      observer.observe(ref.current, { attributes: true });
    }

    return () => observer.disconnect();
  }, [onHighlight]);

  return (
    <CommandItem
      ref={ref}
      className={cn(
        "data-[selected=true]:border-input data-[selected=true]:bg-input/50 h-11 rounded-md border border-transparent px-3 font-medium flex items-center gap-3",
        className
      )}
      {...props}
    >
      {children}
    </CommandItem>
  );
}

// Keyboard hint component
function CommandMenuKbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "bg-background text-muted-foreground pointer-events-none inline-flex h-5 items-center justify-center gap-1 rounded border border-border/50 px-1.5 font-mono text-[10px] font-medium select-none",
        className
      )}
      {...props}
    />
  );
}

//  UTILITY COMPONENTS

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
    window?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "text-xs text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={handleClick}
    >
      Back to Top <Icon name="arrow-up" />
    </Button>
  );
}
