import { Building2, Users } from "lucide-react";
import {
  DashboardSection,
  EmptyNote,
  Panel,
  SectionError,
} from "@/components/application/dashboard/primitives";
import {
  KpiCard,
  KpiGrid,
  KpiGridSkeleton,
} from "@/components/application/stats-card";
import { HeaderBar } from "@/components/common/header-bar";
import { RouterCard } from "@/components/common/router-card";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { getHostelRoutes } from "@/constants/links";
import { getHostelOverview } from "~/actions/hostel.core";
import type { HostelType } from "~/models/hostel_n_outpass";

const GENDER_LABEL: Record<HostelType["gender"], string> = {
  male: "Boys' hostel",
  female: "Girls' hostel",
  guest_hostel: "Guest hostel",
};

const ROLE_LABEL: Record<string, string> = {
  warden: "Warden",
  assistant_warden: "Assistant warden",
  mmca: "MMCA",
};

export function HostelOverview({
  hostel,
  moderator,
}: {
  hostel: Pick<
    HostelType,
    "name" | "slug" | "gender" | "warden" | "administrators"
  >;
  moderator: string;
}) {
  const base = `/${moderator}/h/${hostel.slug}`;
  const staff = [
    { name: hostel.warden.name, email: hostel.warden.email, role: "Warden" },
    ...(hostel.administrators ?? []).map((a) => ({
      name: a.name,
      email: a.email,
      role: ROLE_LABEL[a.role] ?? a.role,
    })),
  ];

  return (
    <div className="@container flex flex-col gap-10">
      <HeaderBar
        Icon={Building2}
        titleNode={hostel.name}
        descriptionNode={`${GENDER_LABEL[hostel.gender] ?? "Hostel"}. Residents, rooms and outpasses in one place.`}
        actionNode={
          <ButtonLink href={`${base}/outpass-requests`} variant="primary">
            Review outpasses
          </ButtonLink>
        }
      />

      <ErrorBoundaryWithSuspense
        loadingFallback={<KpiGridSkeleton />}
        fallback={<SectionError what="Hostel numbers" />}
      >
        <OverviewKpis slug={hostel.slug} base={base} />
      </ErrorBoundaryWithSuspense>

      <DashboardSection id="operations" title="Hostel operations">
        <div className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
          {getHostelRoutes(moderator, hostel.slug).map((route) => (
            <RouterCard
              key={route.href}
              Icon={route.Icon}
              title={route.title}
              description={route.description}
              href={route.href}
              disabled={route.disabled}
            />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection id="staff" title="Staff">
        {staff.length === 0 ? (
          <EmptyNote icon={<Users />} title="No staff listed" />
        ) : (
          <Panel className="p-0">
            <ul className="divide-y divide-border">
              {staff.map((person) => (
                <li
                  key={`${person.role}-${person.email}`}
                  className="flex flex-col gap-0.5 px-5 py-3 @xl:flex-row @xl:items-center @xl:justify-between @xl:gap-4"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-body font-medium text-foreground">
                      {person.name || "Name not set"}
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">
                      {person.email}
                    </span>
                  </span>
                  <span className="w-fit rounded-full border border-border px-2 py-0.5 text-caption font-medium text-foreground">
                    {person.role}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </DashboardSection>
    </div>
  );
}

async function OverviewKpis({ slug, base }: { slug: string; base: string }) {
  const res = await getHostelOverview(slug);
  if (!res.success || !res.data) {
    throw new Error(res.error ?? "Failed to load numbers");
  }
  const s = res.data;
  const vacant = Math.max(0, s.beds - s.occupiedBeds);
  return (
    <KpiGrid>
      <KpiCard
        label="Pending outpasses"
        value={s.pendingOutpasses}
        hint={s.pendingOutpasses > 0 ? "Waiting for review" : "Queue is clear"}
        href={`${base}/outpass-requests`}
      />
      <KpiCard
        label="Students out now"
        value={s.outNow}
        hint="Exited, not yet back"
        href={`${base}/outpass-logs?status=in_use`}
      />
      <KpiCard
        label="Residents"
        value={s.residents}
        hint={s.banned > 0 ? `${s.banned} barred from outpasses` : undefined}
        href={`${base}/students`}
      />
      <KpiCard
        label="Vacant beds"
        value={s.beds > 0 ? vacant : null}
        hint={
          s.rooms > 0
            ? `${s.rooms} rooms, ${s.beds} beds`
            : "Import rooms to track beds"
        }
        href={`${base}/rooms`}
      />
    </KpiGrid>
  );
}
