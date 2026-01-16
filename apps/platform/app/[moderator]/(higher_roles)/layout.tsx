import Page403 from "@/components/utils/403";
import { notFound } from "next/navigation";
import { ALLOWED_ROLES, ROLES_ENUMS } from "~/constants";

const NOT_ALLOWED_ROLES = [ROLES_ENUMS.STUDENT, ROLES_ENUMS.GUARD];

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    moderator: typeof ALLOWED_ROLES[number];
  }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  // const session = await getSession();
  const { moderator } = await params;
  // Check if the moderator role is not allowed
  if (
    !ALLOWED_ROLES.includes(moderator as (typeof ALLOWED_ROLES)[number]) ||
    NOT_ALLOWED_ROLES.includes(moderator as (typeof NOT_ALLOWED_ROLES)[number])
  ) {
    return notFound();
  }

  if (
    NOT_ALLOWED_ROLES.includes(moderator as (typeof NOT_ALLOWED_ROLES)[number])
  ) {
    return <Page403 />;
  }

  return children;
}
