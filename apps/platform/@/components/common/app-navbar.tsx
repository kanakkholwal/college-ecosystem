"use client";

import ProfileDropdown from "@/components/common/profile-dropdown";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getNavLinks, getSideNavLinks } from "@/constants/links";
import { cn } from "@/lib/utils";
import { ChevronRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useMemo, useTransition } from "react";
import toast from "react-hot-toast";
import { authClient, type Session } from "~/auth/client";
import { changeCase } from "~/utils/string";
import { QuickLinks } from "./navbar";
import { ThemeSwitcher } from "./theme-switcher";

const SEGMENT_LABELS: Record<string, string> = {
  h: "Hostel",
};

function segmentLabel(segment: string) {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {}
  if (SEGMENT_LABELS[decoded]) return SEGMENT_LABELS[decoded];
  // Ids and roll numbers read better verbatim than title-cased.
  return /\d/.test(decoded) ? decoded : changeCase(decoded, "title");
}

/** Workspace context bar: sidebar toggle, breadcrumb, search, theme and the user menu. */
export default function Navbar({
  user,
  className,
  impersonatedBy,
  moderator,
}: {
  user: Session["user"];
  className?: string;
  impersonatedBy?: string | null;
  moderator?: string;
}) {
  const pathname = usePathname();
  const navLinks = useMemo(() => getNavLinks(user), [user]);
  const role = moderator || pathname.split("/")[1] || user.role;

  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const titles = new Map<string, string>();
    for (const link of getSideNavLinks(role)) {
      titles.set(link.href, link.title);
      for (const item of link.items ?? []) titles.set(item.href, item.title);
    }
    const trail = segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      return {
        key: href,
        href,
        label:
          index === 0
            ? changeCase(segment, "title")
            : (titles.get(href) ?? segmentLabel(segment)),
      };
    });
    if (trail.length === 1)
      trail.push({ key: "dashboard", href: pathname, label: "Dashboard" });
    return trail;
  }, [pathname, role]);

  return (
    <>
      {impersonatedBy && <ImpersonationBanner user={user} />}
      <header
        className={cn(
          "flex min-h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-3 md:px-4",
          className
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SidebarTrigger />
          <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border" />
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1 text-body">
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1;
                const edge = index === 0 || last;
                return (
                  <Fragment key={crumb.key}>
                    {index > 0 && (
                      <li
                        aria-hidden="true"
                        className={cn(
                          "shrink-0 text-muted-foreground",
                          !last && "hidden md:block"
                        )}
                      >
                        <ChevronRight className="size-3.5" />
                      </li>
                    )}
                    <li
                      className={cn(
                        "min-w-0",
                        edge ? "flex" : "hidden md:flex",
                        last ? "shrink" : "shrink-0"
                      )}
                    >
                      {last ? (
                        <span
                          aria-current="page"
                          title={crumb.label}
                          className="max-w-60 truncate font-medium text-foreground"
                        >
                          {crumb.label}
                        </span>
                      ) : (
                        <Link
                          href={crumb.href}
                          title={crumb.label}
                          className="max-w-40 truncate rounded-md px-1 text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </li>
                  </Fragment>
                );
              })}
            </ol>
          </nav>
        </div>

        <QuickLinks user={user} publicLinks={navLinks} />

        <div className="flex items-center justify-end gap-1.5 md:flex-1">
          <ThemeSwitcher />
          <ProfileDropdown user={user} />
        </div>
      </header>
    </>
  );
}

function ImpersonationBanner({ user }: { user: Session["user"] }) {
  const [pending, startTransition] = useTransition();

  const stop = () =>
    startTransition(async () => {
      const { error } = await authClient.admin.stopImpersonating();
      if (error) {
        toast.error(error.message || "Could not stop impersonating");
        return;
      }
      // A full load drops the impersonated session from every cached segment.
      window.location.assign("/dashboard");
    });

  return (
    <div
      role="status"
      className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-warning/10 px-3 py-2 md:px-4"
    >
      <ShieldAlert
        className="size-4 shrink-0 text-warning"
        aria-hidden="true"
      />
      <p className="min-w-0 flex-1 text-body text-foreground">
        <span className="font-medium">Impersonating {user.name}</span>{" "}
        <span className="text-muted-foreground">
          (@{user.username}). Every action runs as this account.
        </span>
      </p>
      <Button size="sm" variant="outline" onClick={stop} disabled={pending}>
        {pending ? "Stopping..." : "Stop impersonating"}
      </Button>
    </div>
  );
}
