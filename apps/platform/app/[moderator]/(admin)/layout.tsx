import Page403 from "@/components/utils/403";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { isAdminLike } from "~/auth/guards";
import { type ALLOWED_ROLES, ROLES_ENUMS } from "~/constants";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    moderator: (typeof ALLOWED_ROLES)[number];
  }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { moderator } = await params;
  if (moderator !== ROLES_ENUMS.ADMIN) {
    return notFound();
  }
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (session && !isAdminLike(session.user)) {
    console.log("403 from layout: admin");
    return <Page403 />;
  }

  return children;
}
