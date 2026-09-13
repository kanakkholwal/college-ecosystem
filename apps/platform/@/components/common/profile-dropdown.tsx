"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Separator } from "@/components/ui/separator";
import { socials, SUPPORT_LINKS } from "@/constants/links";
import { cn } from "@/lib/utils";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import {
  ArrowUpRight,
  Home,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "~/auth/client";
import { authClient } from "~/auth/client";
import { changeCase } from "~/utils/string";

interface ProfileDropdownProps {
  user: Session["user"];
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const router = useRouter();

  // Avatar Logic
  const avatarSrc =
    user.image && user.image !== "null" && user.image.trim().length > 0
      ? user.image
      : `https://api.dicebear.com/5.x/initials/svg?seed=${user.name}`;

  // Role Links
  const platformLinks = [
    ...(user.role === "admin"
      ? [{ Icon: ShieldAlert, href: "/admin", title: "Admin Console" }]
      : []),
    ...user.other_roles.map((role) => ({
      Icon: LayoutGrid,
      href: `/${role}`,
      title: `${changeCase(role, "title")}`,
    })),
  ];

  return (
    <ResponsiveDialog
      title="Account"
      description="Manage your profile."
      className="px-3 gap-0 overflow-hidden flex flex-col sm:max-w-lg"
      btnProps={{
        size: "icon",
        rounded: "full",
        variant: "ghost",
        className:
          "size-9 rounded-full border border-border transition-colors hover:bg-muted",
        children: (
          <Avatar className="size-8 rounded-full">
            <AvatarImage src={avatarSrc} alt={user.username} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        ),
      }}
    >
      <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
        <div className="relative shrink-0">
          <Avatar className="size-16 rounded-xl border border-border shadow-sm">
            <AvatarImage src={avatarSrc} alt={user.username} />
            <AvatarFallback className="rounded-xl">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-background bg-success" />
        </div>

        <div className="flex flex-col justify-center items-start min-w-0 flex-1">
          <h4 className="text-body-lg font-medium">{user.name}</h4>
          <p className="text-muted-foreground font-medium text-xs font-mono">
            {user.email}
            <Link
              href={`/results/${user.username}`}
              className="text-primary hover:underline ml-2 text-xs"
            >
              View Result
              <ArrowTopRightIcon className="inline-block size-3 ml-1" />
            </Link>
          </p>
          <p>
            <Badge size="sm" className="font-mono whitespace-nowrap">
              {user.department || "Student"}
            </Badge>
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        <div className="pb-2">
          {/* Section Header with Count */}
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-caption font-semibold text-muted-foreground">
              Workspaces
            </span>
            {platformLinks.length > 0 && (
              <Badge variant="default" size="sm" className="font-mono">
                {platformLinks.length}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1">
            {platformLinks.length > 0 ? (
              platformLinks.map((link) => {
                // Check if this is the Admin link for special styling
                const isAdmin = link.href === "/admin";

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 transition-all duration-200",
                      // Conditional Hover Styles
                      isAdmin
                        ? "col-span-2 hover:border-destructive/30 hover:bg-destructive/10"
                        : "hover:border-border hover:bg-muted"
                    )}
                  >
                    {/* Icon Box */}
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md border shadow-sm transition-colors",
                        isAdmin
                          ? "border-destructive/30 bg-background text-destructive"
                          : "border-border bg-background text-muted-foreground group-hover:text-primary"
                      )}
                    >
                      <link.Icon className="size-4" />
                    </div>

                    {/* Title */}
                    <div className="flex-1 truncate">
                      <span
                        className={cn(
                          "block text-xs font-medium text-foreground transition-colors",
                          isAdmin
                            ? "group-hover:text-destructive"
                            : "group-hover:text-primary"
                        )}
                      >
                        {link.title}
                      </span>
                      <span className="block truncate text-caption text-muted-foreground">
                        {isAdmin ? "System Configuration" : "Manage dashboard"}
                      </span>
                    </div>

                    {/* Action Icon */}
                    <ArrowUpRight
                      className={cn(
                        "size-3 transition-all duration-300 opacity-0 -translate-x-1 translate-y-1",
                        "group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0",
                        isAdmin ? "text-destructive" : "text-primary"
                      )}
                    />
                  </Link>
                );
              })
            ) : (
              // Improved Empty State
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted px-3 py-4">
                <div className="flex size-8 items-center justify-center rounded-full bg-background text-muted-foreground">
                  <ShieldAlert className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground">
                    No Access
                  </span>
                  <span className="text-caption text-muted-foreground">
                    Contact admin for roles.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <Separator className="mx-2 my-1 w-auto opacity-50" />

        {/* Resources */}
        <div className="px-2 pt-1">
          <div className="px-2 py-1.5 text-caption font-semibold text-muted-foreground">
            Shortcuts
          </div>
          <div className="grid grid-cols-2 gap-0.5">
            {SUPPORT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex h-9 items-center justify-between rounded-md px-2 text-body text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <LifeBuoy className="size-3.5 opacity-70" />
                  {link.title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* --- FIXED FOOTER --- */}
      <div className="shrink-0 border-t border-border bg-muted p-3">
        <div className="flex items-center justify-between gap-2">
          {/* Home Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/">
              <Home className="mr-1.5 size-3.5" /> Home
            </Link>
          </Button>

          <div className="h-4 w-px bg-border" />

          {/* Social Icons (Compact) */}
          <div className="flex items-center gap-1">
            {socials.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                <link.icon className="size-3.5" />
              </Link>
            ))}
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Sign Out */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-body text-destructive hover:bg-destructive/10"
            onClick={async () => {
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => router.push("/auth/sign-in"),
                },
              });
            }}
          >
            Sign Out
            <LogOut className="ml-1.5 size-3.5" />
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
