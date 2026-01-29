"use client";

import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { authClient, type Session } from "~/auth/client";

// UI Components
import ProfileDropdown from "@/components/common/profile-dropdown";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getNavLinks } from "@/constants/links";
import { titlesMap } from "@/constants/titles";

// Icons
import { cn } from "@/lib/utils";
import { ShieldAlert, Slash, X } from "lucide-react";
import { QuickLinks } from "./navbar";
import { ThemeSwitcher } from "./theme-switcher";

export default function Navbar({
  user,
  className,
  impersonatedBy,
}: {
  user: Session["user"];
  className?: string;
  impersonatedBy?: string | null;
}) {
  const pathname = usePathname();
  const navLinks = getNavLinks(user);

  // Derive Page Data
  const currentTitle = titlesMap.get(pathname);
  const title = currentTitle?.title ?? "Dashboard";
  const description = currentTitle?.description ?? pathname.split("/").pop();

  const handleStopImpersonation = async () => {
    toast.promise(
      authClient.admin.stopImpersonating(),
      {
        loading: "Stopping impersonation...",
        success: "Impersonation stopped successfully",
        error: "Failed to stop impersonation",
      },
      { position: "top-right", duration: 3000 }
    );
  };

  return (
    <nav className={cn("sticky top-0 z-10 w-full flex items-center gap-2 px-4 py-3 bg-background/80 backdrop-blur-md transition-all support-[backdrop-filter]:bg-background/60", className)}>

      <div className="flex items-center gap-2 md:gap-3">
        <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" />

        <Separator orientation="vertical" className="h-4 bg-border/60 hidden md:block" />

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <Slash className="h-3 w-3 text-muted-foreground/40 hidden lg:block -rotate-12" />
            <p className="text-xs text-muted-foreground hidden lg:block truncate max-w-[300px]">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-4">

        {impersonatedBy && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 animate-in fade-in slide-in-from-top-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span className="truncate max-w-[150px]">
              Viewing as <span className="font-bold">{user.name}</span>
            </span>
            <Separator orientation="vertical" className="h-3 bg-amber-500/20 mx-1" />
            <button
              onClick={handleStopImpersonation}
              className="hover:bg-amber-500/20 rounded-full p-0.5 transition-colors"
              title="Stop Impersonation"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <QuickLinks user={user} publicLinks={navLinks} />
          <ThemeSwitcher />
        </div>

        <Separator orientation="vertical" className="h-6 bg-border/60 hidden sm:block" />

        {/* Profile */}
        <ProfileDropdown user={user} />
      </div>

      {/* Mobile Impersonation Alert (Sticky overlay if needed, or simple block) */}
      {impersonatedBy && (
        <div className="sm:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={handleStopImpersonation}
            variant="destructive"
            size="sm"
            className="shadow-lg rounded-full text-xs font-medium"
          >
            <ShieldAlert className="mr-2 h-3 w-3" /> Stop Viewing as {user.name.split(' ')[0]}
          </Button>
        </div>
      )}
    </nav>
  );
}