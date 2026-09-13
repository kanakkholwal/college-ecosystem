import { notFound } from "next/navigation";
import { AccessNotice } from "@/components/application/hostel/ui";
import { ROLES_ENUMS } from "~/constants";
import { getHostelSession, isCampusWide } from "~/lib/hostel-access";

const DIRECTORY_ROUTES: string[] = [
  ROLES_ENUMS.CHIEF_WARDEN,
  ROLES_ENUMS.ADMIN,
];

export default async function HostelsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ moderator: string }>;
}) {
  const [{ moderator }, session] = await Promise.all([
    params,
    getHostelSession(),
  ]);
  if (!DIRECTORY_ROUTES.includes(moderator)) notFound();

  if (!session?.user || !isCampusWide(session.user)) {
    return (
      <AccessNotice
        title="The hostel directory is for the chief warden and admins"
        description="Wardens can reach their own hostel from the dashboard."
      />
    );
  }
  return children;
}
