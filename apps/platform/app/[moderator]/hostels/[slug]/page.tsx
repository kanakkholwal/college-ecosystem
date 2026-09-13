import { notFound } from "next/navigation";
import { HostelOverview } from "@/components/application/hostel/hostel-overview";
import { AccessNotice } from "@/components/application/hostel/ui";
import { authorizeHostelManager } from "~/lib/hostel-access";

export default async function HostelPage({
  params,
}: {
  params: Promise<{ moderator: string; slug: string }>;
}) {
  const { slug, moderator } = await params;
  const access = await authorizeHostelManager(slug);
  if (!access.ok) {
    if (access.status === 404) notFound();
    return (
      <AccessNotice
        title="You can't open this hostel"
        description={access.error}
      />
    );
  }

  return <HostelOverview hostel={access.hostel} moderator={moderator} />;
}
