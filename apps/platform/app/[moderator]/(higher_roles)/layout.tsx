import { notFound } from "next/navigation";
import { ALLOWED_ROLES, ROLES_ENUMS } from "~/constants";

// The parent layout already matched the session to this segment.
const NOT_ALLOWED_ROLES: string[] = [ROLES_ENUMS.STUDENT, ROLES_ENUMS.GUARD];

export default async function HigherRolesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ moderator: string }>;
}) {
  const { moderator } = await params;
  if (
    !ALLOWED_ROLES.includes(moderator) ||
    NOT_ALLOWED_ROLES.includes(moderator)
  ) {
    notFound();
  }
  return children;
}
