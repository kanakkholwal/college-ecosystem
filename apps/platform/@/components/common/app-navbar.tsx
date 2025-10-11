"use client";

import ProfileDropdown from "@/components/common/profile-dropdown";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getNavLinks } from "@/constants/links";
import { titlesMap } from "@/constants/titles";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { authClient, type Session } from "~/auth/client";
import { Icon } from "../icons";
import { Badge } from "../ui/badge";
import { QuickLinks } from "./navbar";
import { ThemeSwitcher } from "./theme-switcher";

export default function Navbar({
  user,
  impersonatedBy,
}: {
  user: Session["user"];
  impersonatedBy?: string | null;
}) {
  const pathname = usePathname();
  const navLinks = getNavLinks(user);

  const handleStopImpersonation = async () => {
    toast.promise(
      authClient.admin.stopImpersonating(),
      {
        loading: "Stopping impersonation...",
        success: "Impersonation stopped successfully",
        error: "Failed to stop impersonation",
      },
      {
        position: "top-right",
        duration: 3000,
      }
    );
  };

  return (
    <nav className="w-full p-4 backdrop-blur-xs border-b border-dashed flex items-center lg:px-6 z-2">
      <SidebarTrigger className="mx-2" />
      <div className="flex items-start flex-col">
        <h3 className="text-sm font-semibold">
          {titlesMap.get(pathname)?.title ?? "Dashboard"}
        </h3>
        <p className="text-xs text-muted-foreground font-normal truncate max-w-28 lg:max-w-80">
          {titlesMap.get(pathname)?.description ?? pathname}
        </p>
      </div>
      <div className="ml-auto inline-flex gap-2 items-center">
        {impersonatedBy && (
          <div className="flex items-center bg-background border rounded-md py-1 h-8 px-2">
            <Badge size="sm">
              <Icon name="eye" />
              <span className="font-medium">
                Viewing as <span className="text-primary">{user.name}</span>
              </span>
            </Badge>

            <Button
              variant="warning_light"
              size="icon_xs"
              onClick={handleStopImpersonation}
              title="Stop impersonation"
            >
              <Icon name="X" />
            </Button>
          </div>
        )}

        <QuickLinks user={user} publicLinks={navLinks} />
        <ThemeSwitcher />
        <ProfileDropdown user={user} />
      </div>
    </nav>
  );
}
