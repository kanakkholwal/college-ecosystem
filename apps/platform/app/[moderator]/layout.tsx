import { FlickeringGrid } from "@/components/animation/flikering-grid";
import AdUnit from "@/components/common/adsense";
import Navbar from "@/components/common/app-navbar";
import { AppSidebar } from "@/components/common/sidebar/app-sidebar";
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
      <AppSidebar user={session.user} moderator={moderator} className="border-r-transparent" />
      <SidebarInset className="flex flex-col flex-1 w-full rounded-t-2xl">
        <Navbar
          user={session.user}
          impersonatedBy={session.session.impersonatedBy}
        />

        <div className="relative flex-1 mr-2">
          <div className="absolute top-0 left-0 z-0 w-full min-h-80 mask-[linear-gradient(to_top,transparent_25%,black_95%)]">
            <FlickeringGrid
              className="absolute top-0 left-0 size-full"
              squareSize={4}
              gridGap={6}
              color="#6B7280"
              maxOpacity={0.2}
              flickerChance={0.05}
            />
          </div>

          <main className="relative rounded-2xl overflow-hidden dark:bg-muted flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8 @container">
            <div className="mx-auto max-w-7xl space-y-8 z-4">
              <header className="relative">
                <div className="flex items-center justify-center w-full mx-auto max-w-7xl empty:hidden empty:p-0">
                  <AdUnit adSlot="display-horizontal" key="dashboard-top" />
                </div>
              </header>
              {children}
            </div>
          </main>

          <footer className="relative">
            <div className="flex items-center justify-center w-full mx-auto max-w-7xl empty:hidden empty:p-0">
              <AdUnit adSlot="display-horizontal" key="dashboard-bottom" />
            </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}