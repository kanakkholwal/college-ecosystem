"use client";

import { ROLES_ENUMS } from "~/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORT_LINKS } from "@/constants/links";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  GraduationCap,
  LayoutGrid,
  LifeBuoy,
  LoaderCircle,
  LogOut,
  type LucideIcon,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Session } from "~/auth/client";
import { authClient } from "~/auth/client";
import { changeCase } from "~/utils/string";

interface ProfileDropdownProps {
  user: Session["user"];
}

type Row = {
  href: string;
  label: string;
  Icon: LucideIcon;
  external?: boolean;
};

/** Account menu capped at ~7 rows: long dashboard and help lists live in submenus (drawer sections on phones). */
export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const hasImage =
    Boolean(user.image) &&
    user.image !== "null" &&
    (user.image?.trim().length ?? 0) > 0;
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const dashboards: Row[] = [
    ...(user.role === ROLES_ENUMS.ADMIN
      ? [{ href: "/admin", label: "Admin console", Icon: ShieldCheck }]
      : []),
    ...user.other_roles
      .filter((role) => role !== ROLES_ENUMS.ADMIN)
      .map((role) => ({
        href: `/${role}`,
        label: changeCase(role, "title"),
        Icon: LayoutGrid,
      })),
  ];
  const currentSegment = `/${pathname.split("/")[1] ?? ""}`;
  const current = dashboards.find((d) => d.href === currentSegment);
  const primary =
    current ??
    dashboards.find((d) => d.href === `/${user.other_roles[0]}`) ??
    dashboards[0];

  const account: Row[] = [
    { href: `/u/${user.username}`, label: "Your profile", Icon: UserRound },
    ...(user.other_roles.includes("student")
      ? [
          {
            href: `/results/${user.username}`,
            label: "Your result",
            Icon: GraduationCap,
          },
        ]
      : []),
    ...(user.other_roles[0]
      ? [
          {
            href: `/${user.other_roles[0]}/settings`,
            label: "Settings",
            Icon: Settings,
          },
        ]
      : []),
  ];

  const help: Row[] = SUPPORT_LINKS.map((link) => ({
    href: link.href,
    label: link.title,
    Icon: ArrowUpRight,
    external: true,
  }));

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/auth/sign-in"),
        onError: () => setSigningOut(false),
      },
    });
  };

  const avatar = (size: "sm" | "lg") => (
    <Avatar
      className={cn(
        "shrink-0 rounded-full border border-border",
        size === "sm" ? "size-8" : "size-10"
      )}
    >
      {hasImage && <AvatarImage src={user.image ?? undefined} alt="" />}
      <AvatarFallback className="bg-muted text-caption font-semibold text-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  const identity = (
    <div className="flex min-w-0 items-center gap-3">
      {avatar("lg")}
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-foreground">
          {changeCase(user.name.toLowerCase(), "title")}
        </p>
        <p className="truncate text-caption text-muted-foreground">
          {user.email}
        </p>
        {user.department && (
          <p
            className="truncate text-caption text-muted-foreground"
            title={user.department}
          >
            {user.department}
          </p>
        )}
      </div>
    </div>
  );

  const signOutLabel = (
    <>
      {signingOut ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="size-4" aria-hidden="true" />
      )}
      {signingOut ? "Signing out..." : "Sign out"}
    </>
  );

  const trigger = (
    <button
      type="button"
      aria-label={`Account menu for ${user.name}`}
      onClick={isDesktop ? undefined : () => setDrawerOpen(true)}
      className="grid size-10 place-items-center rounded-full outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted"
    >
      {avatar("sm")}
    </button>
  );

  const desktopRow = "h-9 gap-2.5 rounded-md px-2.5 text-body focus:bg-muted";

  if (isDesktop) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-72 rounded-xl border-border p-1.5 shadow-lg"
        >
          <DropdownMenuLabel className="px-2.5 py-2 font-normal">
            {identity}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {primary ? (
            <DropdownMenuItem asChild className={desktopRow}>
              <Link href={primary.href}>
                <primary.Icon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate">
                  {current ? `${primary.label} dashboard` : "Go to dashboard"}
                </span>
              </Link>
            </DropdownMenuItem>
          ) : (
            <p className="px-2.5 py-2 text-caption text-muted-foreground">
              No dashboards yet. Ask an admin for access.
            </p>
          )}
          {dashboards.length > 1 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={cn(desktopRow, "cursor-pointer text-foreground")}
              >
                <ArrowLeftRight
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="flex-1">Switch dashboard</span>
                <span className="text-caption tabular-nums text-muted-foreground">
                  {dashboards.length}
                </span>
              </DropdownMenuSubTrigger>
              {/* Portaled: the parent panel clips (overflow + transform) any submenu rendered inside it. */}
              <DropdownMenuPortal>
                <DropdownMenuSubContent
                  sideOffset={6}
                  className="max-h-80 w-56 overflow-y-auto rounded-xl border-border bg-popover p-1.5 shadow-lg backdrop-blur-none"
                >
                  {dashboards.map((d) => (
                    <DropdownMenuItem
                      key={d.href}
                      asChild
                      className={desktopRow}
                    >
                      <Link
                        href={d.href}
                        aria-current={d === current ? "page" : undefined}
                      >
                        <d.Icon
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {d.label}
                        </span>
                        {d === current && (
                          <Check
                            className="size-4 text-primary"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}

          <DropdownMenuSeparator />
          {account.map((row) => (
            <DropdownMenuItem key={row.href} asChild className={desktopRow}>
              <Link href={row.href}>
                <row.Icon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {row.label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className={cn(desktopRow, "cursor-pointer text-foreground")}
            >
              <LifeBuoy
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="flex-1">Help &amp; feedback</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={6}
                className="w-60 rounded-xl border-border bg-popover p-1.5 shadow-lg backdrop-blur-none"
              >
                {help.map((row) => (
                  <DropdownMenuItem
                    key={row.href}
                    asChild
                    className={desktopRow}
                  >
                    <a
                      href={row.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {row.label}
                      </span>
                      <row.Icon
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={signingOut}
            onSelect={(event) => {
              event.preventDefault();
              signOut();
            }}
            className={cn(
              desktopRow,
              "text-destructive focus:bg-destructive/10 focus:text-destructive"
            )}
          >
            {signOutLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const close = () => setDrawerOpen(false);
  const mobileRow =
    "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-body text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";

  return (
    <>
      {trigger}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[85svh]">
          <DrawerTitle className="sr-only">Account</DrawerTitle>
          <DrawerDescription className="sr-only">
            Dashboards, profile, help and sign out
          </DrawerDescription>
          <div className="border-b border-border px-5 py-4">{identity}</div>
          <nav
            aria-label="Account"
            className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-3"
          >
            {primary && (
              <Link href={primary.href} onClick={close} className={mobileRow}>
                <primary.Icon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {current ? `${primary.label} dashboard` : "Go to dashboard"}
              </Link>
            )}
            {dashboards.length > 1 && (
              <DrawerSection
                title="Switch dashboard"
                Icon={ArrowLeftRight}
                count={dashboards.length}
              >
                {dashboards.map((d) => (
                  <Link
                    key={d.href}
                    href={d.href}
                    onClick={close}
                    aria-current={d === current ? "page" : undefined}
                    className={cn(mobileRow, "pl-10")}
                  >
                    <span className="flex-1 truncate">{d.label}</span>
                    {d === current && (
                      <Check
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                ))}
              </DrawerSection>
            )}
            <div className="my-1 h-px bg-border" />
            {account.map((row) => (
              <Link
                key={row.href}
                href={row.href}
                onClick={close}
                className={mobileRow}
              >
                <row.Icon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {row.label}
              </Link>
            ))}
            <DrawerSection title="Help & feedback" Icon={LifeBuoy}>
              {help.map((row) => (
                <a
                  key={row.href}
                  href={row.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className={cn(mobileRow, "pl-10")}
                >
                  <span className="flex-1 truncate">{row.label}</span>
                  <row.Icon
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ))}
            </DrawerSection>
          </nav>
          <div className="border-t border-border px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className={cn(
                mobileRow,
                "font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
              )}
            >
              {signOutLabel}
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function DrawerSection({
  title,
  Icon,
  count,
  children,
}: {
  title: string;
  Icon: LucideIcon;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <details className="group">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-3 rounded-lg px-3 text-body text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="flex-1">{title}</span>
        {count !== undefined && (
          <span className="text-caption tabular-nums text-muted-foreground">
            {count}
          </span>
        )}
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="flex flex-col gap-0.5 pt-0.5">{children}</div>
    </details>
  );
}
