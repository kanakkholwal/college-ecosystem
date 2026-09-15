import {
  DashboardHeader,
  DashboardRoot,
  DashboardSection,
  EmptyNote,
  PanelSkeleton,
  SectionError,
} from "@/components/application/dashboard/primitives";
import { getViewer, greeting } from "@/components/application/dashboard/viewer";
import {
  KpiCard,
  KpiGrid,
  KpiGridSkeleton,
} from "@/components/application/stats-card";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ArrowRight, Building2, Plus } from "lucide-react";
import Link from "next/link";
import { getHostelsStats } from "~/actions/hostel.core";
import type { HostelType } from "~/models/hostel_n_outpass";
import { CreateHostelForm, ImportFromSiteButton } from "../hostels/client";

const GENDER_LABEL: Record<HostelType["gender"], string> = {
  male: "Boys",
  female: "Girls",
  guest_hostel: "Guest",
};

export default async function ChiefWardenDashboard({ role }: { role: string }) {
  const viewer = await getViewer();

  return (
    <DashboardRoot>
      <DashboardHeader
        title={greeting(viewer?.name)}
        context="Campus residency at a glance: hostels, the people running them, and who lives where."
        actions={
          <ResponsiveDialog
            title="Add a hostel"
            description="Add a new building to the campus accommodation system."
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

      <ErrorBoundaryWithSuspense
        loadingFallback={
          <div className="flex flex-col gap-10">
            <KpiGridSkeleton count={3} />
            <PanelSkeleton rows={4} />
          </div>
        }
        fallback={<SectionError what="Hostel directory" />}
      >
        <HostelOverview role={role} />
      </ErrorBoundaryWithSuspense>
    </DashboardRoot>
  );
}

async function HostelOverview({ role }: { role: string }) {
  const response = await getHostelsStats();
  if (!response.ok) throw new Error("Failed to load hostels");
  const hostels = response.data.hostels;
  const count = (gender: HostelType["gender"]) =>
    hostels.filter((h) => h.gender === gender).length;
  const administrators = hostels.reduce(
    (acc, h) => acc + (h.administrators?.length ?? 0),
    0
  );

  return (
    <>
      <KpiGrid className="@4xl:grid-cols-3">
        <KpiCard
          label="Hostels"
          value={hostels.length}
          hint={`${count("male")} boys, ${count("female")} girls, ${count("guest_hostel")} guest`}
          href={`/${role}/hostels`}
        />
        <KpiCard
          label="Hostel staff"
          value={hostels.length + administrators}
          hint={`${hostels.length} wardens and ${administrators} administrators`}
        />
        <KpiCard
          label="Residents"
          value={response.data.totalStudents}
          hint="Hostel student records, all hostels"
        />
      </KpiGrid>

      <DashboardSection
        id="hostels"
        title="Hostels"
        description="Open a hostel to manage its residents, rooms and outpasses."
        viewAll={
          hostels.length > 0
            ? { href: `/${role}/hostels`, label: "Manage hostels" }
            : undefined
        }
      >
        {hostels.length === 0 ? (
          <EmptyNote
            icon={<Building2 />}
            title="No hostels yet"
            description="Import the hostels listed on the college site, or add one by hand."
            action={<ImportFromSiteButton />}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
            {hostels.map((hostel) => (
              <li key={hostel.slug}>
                <Link
                  href={`/${role}/hostels/${hostel.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring dark:bg-background"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground">
                      <Building2 className="size-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-caption font-medium text-foreground">
                      {GENDER_LABEL[hostel.gender] ?? "Hostel"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-body-lg font-medium text-foreground">
                      {hostel.name}
                    </h3>
                    <p className="truncate text-body text-muted-foreground">
                      Warden: {hostel.warden?.name ?? "Not assigned"}
                    </p>
                  </div>
                  <p className="mt-auto flex items-center justify-between text-caption text-muted-foreground">
                    {hostel.administrators?.length ?? 0} administrators
                    <ArrowRight
                      className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </>
  );
}
