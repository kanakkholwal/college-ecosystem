import { HostelCookieSetter } from "app/[moderator]/dashboards/dashboard.client";
import { notFound } from "next/navigation";
import { AccessNotice } from "@/components/application/hostel/ui";
import { authorizeHostelManager } from "~/lib/hostel-access";

interface HostelLayoutProps {
  children: React.ReactNode;
  params: Promise<{ moderator: string; slug: string }>;
}

// Every hostel sub-route (including client pages) is gated here, not only in its actions.
export default async function HostelLayout({
  children,
  params,
}: HostelLayoutProps) {
  const { moderator, slug } = await params;
  const access = await authorizeHostelManager(slug);

  if (!access.ok) {
    if (access.status === 404) notFound();
    return (
      <AccessNotice
        title="You can't manage this hostel"
        description="Only its warden, assistant wardens and MMCA listed on the hostel record, the chief warden and admins can open these pages."
      />
    );
  }

  return (
    <>
      {children}
      {moderator !== "chief_warden" && <HostelCookieSetter hostelSlug={slug} />}
    </>
  );
}
