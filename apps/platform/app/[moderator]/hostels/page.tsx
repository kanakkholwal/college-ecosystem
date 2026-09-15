import { Building2, Plus } from "lucide-react";
import { Suspense } from "react";
import {
  EmptyNote,
  SectionError,
} from "@/components/application/dashboard/primitives";
import {
  HostelCard,
  HostelGridSkeleton,
} from "@/components/application/hostel/hostel-card";
import { HeaderBar } from "@/components/common/header-bar";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { getHostels } from "~/actions/hostel.core";
import { CreateHostelForm, ImportFromSiteButton } from "./client";

export default async function HostelDirectoryPage({
  params,
}: {
  params: Promise<{ moderator: string }>;
}) {
  const { moderator } = await params;

  return (
    <div className="@container flex flex-col gap-6">
      <HeaderBar
        Icon={Building2}
        titleNode="Hostels"
        descriptionNode="Every hostel on campus. Open one to manage its residents, rooms and outpasses."
        actionNode={
          <ResponsiveDialog
            title="Add a hostel"
            description="Add a building to campus accommodation."
            btnProps={{
              variant: "primary",
              children: (
                <>
                  <Plus aria-hidden="true" /> Add hostel
                </>
              ),
            }}
          >
            <CreateHostelForm />
          </ResponsiveDialog>
        }
      />
      <Suspense fallback={<HostelGridSkeleton />}>
        <HostelGrid moderator={moderator} />
      </Suspense>
    </div>
  );
}

async function HostelGrid({ moderator }: { moderator: string }) {
  const res = await getHostels();
  if (!res.ok) return <SectionError what="Hostels" />;
  const hostels = res.data;

  if (hostels.length === 0) {
    return (
      <EmptyNote
        icon={<Building2 />}
        title="No hostels yet"
        description="Import the hostels listed on the college site, or add one by hand."
        action={<ImportFromSiteButton />}
      />
    );
  }

  return (
    <section aria-label="Hostels" className="flex flex-col gap-3">
      <p className="text-body text-muted-foreground">
        {hostels.length} hostels
      </p>
      <ul className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
        {hostels.map((hostel) => (
          <li key={hostel.slug}>
            {/* The layout admits only campus-wide roles, and they can open every hostel. */}
            <HostelCard
              hostel={hostel}
              href={`/${moderator}/hostels/${hostel.slug}`}
              disabled={false}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
