import {
  DashboardHeader,
  DashboardRoot,
  DashboardSection,
  EmptyNote,
  Panel,
  PanelSkeleton,
  SectionError,
} from "@/components/application/dashboard/primitives";
import { getViewer, greeting } from "@/components/application/dashboard/viewer";
import {
  KpiCard,
  KpiGrid,
  KpiGridSkeleton,
} from "@/components/application/stats-card";
import { RouterCard } from "@/components/common/router-card";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { getHostelRoutes } from "@/constants/links";
import { CircleCheck, DoorOpen } from "lucide-react";
import Link from "next/link";
import { getHostelByUser } from "~/actions/hostel.core";
import {
  getPendingOutpasses,
  getWardenDashboardStats,
} from "~/actions/warden.dashboard";
import { changeCase } from "~/utils/string";
import { HostelCookieSetter } from "./dashboard.client";

const PENDING_PREVIEW = 5;

const GENDER_LABEL: Record<string, string> = {
  male: "Boys' hostel",
  female: "Girls' hostel",
  guest_hostel: "Guest hostel",
};

const campusFormat = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", {
    ...options,
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));

export default async function WardenDashboard({ role }: { role: string }) {
  const [viewer, { success, message, hostel }] = await Promise.all([
    getViewer(),
    getHostelByUser(),
  ]);

  if (!success || !hostel) {
    return (
      <DashboardRoot>
        <DashboardHeader title={greeting(viewer?.name)} />
        <EmptyNote
          icon={<DoorOpen />}
          title="No hostel assigned"
          description={message || "You are not assigned to any hostel yet."}
        />
      </DashboardRoot>
    );
  }

  const base = `/${role}/h/${hostel.slug}`;

  return (
    <DashboardRoot>
      <HostelCookieSetter hostelSlug={hostel.slug} />
      <DashboardHeader
        title={greeting(viewer?.name)}
        context={`${hostel.name}, ${GENDER_LABEL[hostel.gender] ?? "hostel"}. Warden: ${hostel.warden.name}.`}
        actions={
          <ButtonLink href={`${base}/outpass-requests`} variant="primary">
            Review outpasses
          </ButtonLink>
        }
      />

      <ErrorBoundaryWithSuspense
        loadingFallback={<KpiGridSkeleton />}
        fallback={<SectionError what="Hostel numbers" />}
      >
        <WardenKpis slug={hostel.slug} base={base} />
      </ErrorBoundaryWithSuspense>

      <DashboardSection
        id="pending"
        title="Waiting for your approval"
        description="Oldest requests first."
        viewAll={{ href: `${base}/outpass-requests`, label: "All requests" }}
      >
        <ErrorBoundaryWithSuspense
          loadingFallback={<PanelSkeleton rows={PENDING_PREVIEW} />}
          fallback={<SectionError what="Pending outpasses" />}
        >
          <PendingList slug={hostel.slug} base={base} />
        </ErrorBoundaryWithSuspense>
      </DashboardSection>

      <DashboardSection id="operations" title="Hostel operations">
        <div className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
          {getHostelRoutes(role, hostel.slug).map((route) => (
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
    </DashboardRoot>
  );
}

async function WardenKpis({ slug, base }: { slug: string; base: string }) {
  const res = await getWardenDashboardStats(slug);
  if (!res.success || !res.data) {
    throw new Error(res.error ?? "Failed to load dashboard stats");
  }
  const stats = res.data;
  return (
    <KpiGrid>
      <KpiCard
        label="Pending outpasses"
        value={stats.pendingOutpasses}
        hint={
          stats.pendingOutpasses > 0
            ? "Waiting for review right now"
            : "Queue is clear"
        }
        href={`${base}/outpass-requests`}
      />
      <KpiCard
        label="Students out now"
        value={stats.activeOutpasses}
        hint="Outpass in use, not yet back"
        href={`${base}/outpass-logs`}
      />
      <KpiCard
        label="Residents"
        value={stats.totalStudents}
        hint="Students allotted to this hostel"
        href={`${base}/students`}
      />
      <KpiCard
        label="Outpass bans"
        value={stats.bannedStudents}
        hint="Residents currently blocked from outpasses"
        href={`${base}/students`}
      />
    </KpiGrid>
  );
}

async function PendingList({ slug, base }: { slug: string; base: string }) {
  const res = await getPendingOutpasses(slug, 1, PENDING_PREVIEW);
  if (!res.success) throw new Error(res.error ?? "Failed to fetch requests");
  const requests = res.data ?? [];

  if (requests.length === 0) {
    return (
      <EmptyNote
        icon={<CircleCheck />}
        title="No pending requests"
        description="New outpass requests from residents show up here."
      />
    );
  }

  return (
    <Panel className="p-0">
      <ul className="divide-y divide-border">
        {requests.map((request) => (
          <li key={request._id}>
            <Link
              href={`${base}/outpass-requests`}
              className="flex flex-col gap-1 px-5 py-3 outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring @xl:flex-row @xl:items-center @xl:justify-between @xl:gap-4"
            >
              <span className="min-w-0">
                <span className="block truncate text-body font-medium text-foreground">
                  {request.student?.name ?? "Unknown student"}
                </span>
                <span className="block text-caption text-muted-foreground">
                  <span className="font-mono">
                    {request.student?.rollNumber ?? "No roll number"}
                  </span>
                  , room {request.roomNumber}
                </span>
              </span>
              <span className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-0.5 font-medium text-foreground">
                  {changeCase(request.reason, "title")}
                </span>
                <span className="tabular-nums">
                  Out{" "}
                  {campusFormat(request.expectedOutTime, {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="tabular-nums">
                  Requested{" "}
                  {campusFormat(request.createdAt, {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
