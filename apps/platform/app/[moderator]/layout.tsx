import AdUnit from "@/components/common/adsense";
import Navbar from "@/components/common/app-navbar";
import { AppSidebar } from "@/components/common/sidebar/app-sidebar";
import { SIDEBAR_COOKIE_NAME, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Session } from "~/auth";
import { getSession } from "~/auth/server";
import { ALLOWED_ROLES } from "~/constants";
import {
  checkAuthorization,
  SIGN_IN_PATH,
  type DashboardRoute,
} from "~/middleware.setting";
import { changeCase } from "~/utils/string";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    moderator: (typeof ALLOWED_ROLES)[number];
  }>;
}

export async function generateMetadata({
  params,
}: DashboardLayoutProps): Promise<Metadata> {
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

  const session = (await getSession()) as Session | null;
  // Authoritative check: the proxy lets requests through when it cannot read the session.
  if (!session) {
    redirect(`${SIGN_IN_PATH}?next=${encodeURIComponent(`/${moderator}`)}`);
  }
  const authCheck = checkAuthorization(moderator as DashboardRoute, session);
  if (!authCheck.authorized) {
    // checkAuthorization can hand back a bare role name ("student"), so normalise it.
    const destination = authCheck.redirect?.destination;
    redirect(
      destination
        ? destination.startsWith("/")
          ? destination
          : `/${destination}`
        : `/unauthorized?target=${encodeURIComponent(`/${moderator}`)}`
    );
  }

  const sidebarOpen =
    (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  return (
    <SidebarProvider
      defaultOpen={sidebarOpen}
      className="h-svh overflow-hidden bg-canvas"
    >
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-body font-medium text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <AppSidebar user={session.user} moderator={moderator} />
      <div className="flex min-w-0 flex-1 flex-col md:py-2 md:pr-2">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background md:rounded-xl md:border md:border-border md:shadow-xs">
          <Navbar
            user={session.user}
            impersonatedBy={session.session.impersonatedBy}
            moderator={moderator}
          />
          <main
            id="main"
            tabIndex={-1}
            className="@container relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain outline-none [scrollbar-width:thin]"
          >
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:px-8">
              {children}
              {/* Ads trail the content so they never push the page's primary view down. */}
              <aside
                aria-label="Advertisement"
                className="mt-12 grid gap-4 xl:grid-cols-2"
              >
                <AdUnit adSlot="display-horizontal" key="dashboard-top" />
                <AdUnit adSlot="display-horizontal" key="dashboard-bottom" />
              </aside>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
