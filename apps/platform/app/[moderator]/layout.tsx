import Navbar from "@/components/common/app-navbar";
import { AppSidebar } from "@/components/common/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { ROLES } from "~/constants";
import type { Session } from "~/lib/auth";
import { getSession } from "~/lib/auth-server";
import { changeCase } from "~/utils/string";

const ALLOWED_ROLES = [
  ROLES.ADMIN,
  ROLES.FACULTY,
  ROLES.CR,
  ROLES.FACULTY,
  ROLES.CHIEF_WARDEN,
  ROLES.WARDEN,
  ROLES.ASSISTANT_WARDEN,
  ROLES.MMCA,
  ROLES.HOD,
  ROLES.GUARD,
  ROLES.LIBRARIAN,
  ROLES.STUDENT,
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    moderator: string;
  }>;
}

export async function generateMetadata(
  { params }: DashboardLayoutProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
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
  if (
    !ALLOWED_ROLES.includes(moderator as (typeof ALLOWED_ROLES)[number]) &&
    moderator !== "dashboard"
  ) {
    return notFound();
  }

  const session = (await getSession()) as Session;

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} moderator={moderator} />
      <SidebarInset className="flex flex-col flex-1 w-full relative z-0">
        <Navbar user={session.user} />
        {/* <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20 -z-[1]"
        >
          <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700" />
          <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600" />
        </div> */}

        <main className="content  p-4 px-2 md:p-6 z-2 @container space-y-10 min-h-screen h-full">
          {children}
        </main>

        {process.env.NODE_ENV !== "production" && (
          <div className="fixed bottom-0 right-auto left-auto mx-auto p-2 text-xs text-muted-foreground">
            <span className="font-semibold">Environment:</span>{" "}
            {process.env.NODE_ENV}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
