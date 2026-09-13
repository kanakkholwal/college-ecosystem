import { notFound } from "next/navigation";
import { HostelOverview } from "@/components/application/hostel/hostel-overview";
import { authorizeHostelManager } from "~/lib/hostel-access";

export default async function HostelPage({
  params,
}: {
  params: Promise<{ moderator: string; slug: string }>;
}) {
  const { slug, moderator } = await params;
  // Cached with the layout's call, so this costs no extra query.
  const access = await authorizeHostelManager(slug);
  if (!access.ok) notFound();

  return <HostelOverview hostel={access.hostel} moderator={moderator} />;
}
