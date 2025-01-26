"use client";

import ProfileDropdown from "@/components/common/profile-dropdown";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { titlesMap } from "@/constants/titles";
import { usePathname } from "next/navigation";
import type { Session } from "~/lib/auth-client";

export default function Navbar({ user }: { user: Session["user"] }) {
  const pathname = usePathname();

  return (
    <nav className="w-full p-4 backdrop-blur-sm border-b border-solid border-slate-100/50 dark:border-slate-700 flex items-center lg:px-6 z-2">
      <SidebarTrigger className="mx-2" />
      <div className="flex items-start flex-col">
        <h3 className="text-lg font-bold">
          {titlesMap.get(pathname)?.title ?? "Dashboard"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate w-full max-w-64">
          {titlesMap.get(pathname)?.description ?? pathname}
        </p>
      </div>
      <div className="ml-auto inline-flex gap-1 items-center">
        <ProfileDropdown user={user} />
      </div>
    </nav>
  );
}
