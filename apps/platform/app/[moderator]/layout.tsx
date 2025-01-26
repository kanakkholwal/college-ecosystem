import Navbar from "@/components/common/app-navbar";
import { AppSidebar } from "@/components/common/sidebar/app-sidebar";
import Page403 from "@/components/utils/403";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { Session } from "~/lib/auth";
import { getSession } from "~/lib/auth-server";
import { changeCase } from "~/utils/string";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ROLES } from "~/constants";

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
];

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
  // read route params
  const { moderator } = await params;

  return {
    title: `${changeCase(moderator, "title")} Dashboard | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
    description: `Dashboard for ${moderator}`,
  };
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { moderator } = await params;

  const session = (await getSession()) as Session;

  const response = checkAuthorization(moderator, session);

  if (response.redirect) {
    console.log("Redirecting to:", response.redirect.destination);
    return redirect(response.redirect.destination);
  }
  if (response.notFound) {
    console.log("Returning notFound");
    return notFound();
  }
  if (!response.authorized) {
    console.log("Returning Page403");
    return <Page403 />;
  }

  return (
    <SidebarProvider className="selection:bg-primary/10 selection:text-primary">
      <AppSidebar user={session.user} moderator={moderator} />
      <SidebarInset className="flex flex-col flex-1 w-full relative z-0">
        <Navbar user={session.user} />
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20 -z-1"
        >
          <div className="blur-[106px] h-56 bg-linear-to-br from-primary to-purple-400 dark:from-blue-700" />
          <div className="blur-[106px] h-32 bg-linear-to-r from-cyan-400 to-sky-300 dark:to-indigo-600" />
        </div>

        <main className="content p-4 md:p-6 z-2 @container space-y-10 min-h-screen h-full">
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

function checkAuthorization(
  moderator: (typeof ALLOWED_ROLES)[number],
  session: Awaited<ReturnType<typeof getSession>>
) {
  // 1. No session, redirect to sign-in
  if (!session) {
    return {
      redirect: { destination: "/sign-in" },
      authorized: false,
      notFound: false,
    };
  }

  // 2. Invalid role
  if (!ALLOWED_ROLES.includes(moderator)) {
    console.log("Invalid moderator role:", moderator);
    const destination = session.user.other_roles.includes("student")
      ? "/"
      : session.user.other_roles[0] || "/";
    return {
      redirect: { destination },
      authorized: false,
      notFound: false,
    };
  }

  // 4. Authorized check
  if (
    session.user.other_roles
      .map((role) => role.toLowerCase())
      .includes(moderator.toLowerCase()) ||
    session.user.role.toLowerCase() === moderator.toLowerCase()
  ) {
    return {
      notFound: false,
      authorized: true,
      redirect: null,
    };
  }

  return {
    notFound: true,
    authorized: false,
    redirect: null,
  };
}
