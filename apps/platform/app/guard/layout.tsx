import { AppSidebar } from "@/components/common/sidebar/app-sidebar";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Session } from "~/lib/auth";
import { getSession } from "~/lib/auth-server";
import Navbar from "@/components/common/app-navbar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: `Guard Dashboard | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: "Dashboard for guard",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = (await getSession()) as Session;
  if (!session.user.other_roles.includes("guard")) {
    return redirect("/");
  }

  return (
    <SidebarProvider className="selection:bg-primary/10 selection:text-primary">
      <AppSidebar user={session.user} moderator={"guard"} />
      <SidebarInset className="flex flex-col flex-1 w-full relative z-0">
        <Navbar user={session.user} />
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20 -z-1"
        >
          <div className="blur-[106px] h-56 bg-linear-to-br from-primary to-purple-400 dark:from-blue-700" />
          <div className="blur-[106px] h-32 bg-linear-to-r from-cyan-400 to-sky-300 dark:to-indigo-600" />
        </div>

        <main className="content p-4 md:p-6 z-2 @container space-y-10">
          {children}
        </main>
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20 -z-1"
        >
          <div className="blur-[106px] h-32 bg-linear-to-r from-cyan-400 to-sky-300 dark:to-indigo-600" />
          <div className="blur-[106px] h-56 bg-linear-to-br from-primary to-purple-400 dark:from-blue-700" />
        </div>
        {process.env.NODE_ENV !== "production" && (
          <div className="fixed bottom-0 right-0 p-2 text-xs text-gray-500 dark:text-slate-400">
            v0.0.1({process.env.NODE_ENV})
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
