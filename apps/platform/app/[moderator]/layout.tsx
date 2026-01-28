import { FlickeringGrid } from "@/components/animation/flikering-grid";
import AdUnit from "@/components/common/adsense";
import Navbar from "@/components/common/app-navbar";
import { AppSidebar } from "@/components/common/sidebar/app-sidebar";
import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import type { Session } from "~/auth";
import { getSession } from "~/auth/server";
import { ALLOWED_ROLES } from "~/constants";
import { changeCase } from "~/utils/string";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    moderator: (typeof ALLOWED_ROLES)[number];
  }>;
}

export async function generateMetadata(
  { params }: DashboardLayoutProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { moderator } = await params;

  return {
    title: `${changeCase(moderator, "title")} Dashboard`,
    description: `Dashboard for ${moderator}`,
  };
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { moderator } = await params;

  if (!ALLOWED_ROLES.includes(moderator as (typeof ALLOWED_ROLES)[number])) {
    return notFound();
  }

  const session = (await getSession()) as Session;

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} moderator={moderator} />
      <SidebarInset className="flex flex-col flex-1 w-full rounded-t-2xl">
        <Navbar
          user={session.user}
          impersonatedBy={session.session.impersonatedBy}
        />

        <div className="relative flex-1 flex flex-col">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
            <FlickeringGrid
              className="absolute top-0 left-0 size-full opacity-40"
              squareSize={4}
              gridGap={6}
              color="#6B7280"
              maxOpacity={0.3}
              flickerChance={0.05}
            />
          </div>

          <main className="relative flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8 @container">
            <div className="mx-auto max-w-7xl space-y-8">
              {children}
            </div>
          </main>

          <footer className="relative border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="px-4 py-6">
              <AdUnit adSlot="display-horizontal" key="dashboard-bottom" />
            </div>
          </footer>


        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}