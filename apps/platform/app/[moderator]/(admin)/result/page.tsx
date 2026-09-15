import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Database,
  FileSpreadsheet,
  GitBranch,
  Mail,
  RadioTower,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import {
  DashboardRoot,
  DashboardSection,
  Panel,
  PanelSkeleton,
  SectionError,
} from "@/components/application/dashboard/primitives";
import {
  KpiCard,
  KpiGrid,
  KpiGridSkeleton,
} from "@/components/application/stats-card";
import { HeaderBar } from "@/components/common/header-bar";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { LoadError } from "./_components/job-ui";
import { getAbnormalResults, getResultOverview } from "./actions";
import {
  FlaggedRecords,
  RecalculateRanksJob,
  ResultLookup,
  ResultMailer,
  SyncBranchesJob,
} from "./client";

// Two boundaries read the totals; dedupe them within one request.
const loadOverview = cache(getResultOverview);

export const metadata: Metadata = { title: "Results admin" };

type PageProps = { params: Promise<{ moderator: string }> };

export default async function AdminResultPage({ params }: PageProps) {
  const { moderator } = await params;
  const base = `/${moderator}/result`;

  return (
    <DashboardRoot>
      <HeaderBar
        Icon={Database}
        titleNode="Results"
        descriptionNode="Keep stored semester results complete, ranked and correct."
      />

      <ErrorBoundaryWithSuspense
        loadingFallback={<KpiGridSkeleton />}
        fallback={<SectionError what="Result totals" />}
      >
        <OverviewKpis />
      </ErrorBoundaryWithSuspense>

      <DashboardSection
        id="jobs"
        title="Bulk jobs"
        description="Scrape and import add records; the two maintenance jobs rewrite existing ones."
      >
        <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-2">
          <JobLink
            href={`${base}/scraping`}
            icon={<RadioTower />}
            title="Scrape results"
            description="Pull fresh results from the college site for a list of students, with live progress and resume."
          />
          <JobLink
            href={`${base}/import`}
            icon={<FileSpreadsheet />}
            title="Import freshers"
            description="Create records for a new batch from an Excel sheet of names, roll numbers and genders."
          />
          <ErrorBoundaryWithSuspense
            loadingFallback={<PanelSkeleton rows={1} />}
            fallback={<SectionError what="Rank job" />}
          >
            <RankJobPanel />
          </ErrorBoundaryWithSuspense>
          <Panel className="flex flex-col gap-4">
            <JobHeading
              icon={<GitBranch />}
              title="Sync branch changes"
              description="Moves students whose courses show they changed branch."
            />
            <SyncBranchesJob />
          </Panel>
        </div>
      </DashboardSection>

      <DashboardSection
        id="lookup"
        title="One student"
        description="Look up, preview, add, refresh or delete a single record by roll number."
      >
        <Panel className="@container">
          <ResultLookup />
        </Panel>
      </DashboardSection>

      <DashboardSection
        id="flagged"
        title="Flagged records"
        description="Semester count is 2 or more away from the average for the same programme and batch, usually a partial scrape."
      >
        <Panel>
          <ErrorBoundaryWithSuspense
            loadingFallback={
              <PanelSkeleton rows={4} className="border-0 p-0" />
            }
            fallback={<SectionError what="Flagged records" />}
          >
            <FlaggedLoader />
          </ErrorBoundaryWithSuspense>
        </Panel>
      </DashboardSection>

      <DashboardSection
        id="notify"
        title="Notify students"
        description="Email students that new results are up."
      >
        <Panel className="flex flex-col gap-4">
          <JobHeading
            icon={<Mail />}
            title="Result update email"
            description="Uses the result_update template on the mail server."
          />
          <ResultMailer />
        </Panel>
      </DashboardSection>
    </DashboardRoot>
  );
}

async function OverviewKpis() {
  const res = await loadOverview();
  if (!res.ok) return <LoadError what="Result totals" reason={res.error} />;
  const overview = res.data;
  return (
    <KpiGrid label="Result totals">
      <KpiCard
        label="Stored results"
        value={overview.total}
        hint={
          overview.lastUpdatedAt
            ? `Last change ${formatDistanceToNow(new Date(overview.lastUpdatedAt), { addSuffix: true })}`
            : "No records yet"
        }
      />
      <KpiCard
        label="Batches"
        value={overview.batches}
        hint="Distinct batch years"
      />
      <KpiCard
        label="Branches"
        value={overview.branches}
        hint="Distinct branch names"
      />
      <KpiCard
        label="With a failed course"
        value={overview.withFailedCourse}
        hint="Records the backlog scrape list picks up"
      />
    </KpiGrid>
  );
}

async function RankJobPanel() {
  const res = await loadOverview();
  return (
    <Panel className="flex flex-col gap-4">
      <JobHeading
        icon={<Trophy />}
        title="Recalculate ranks"
        description="Rebuilds college, batch, branch and class ranks from the latest CGPI."
      />
      <RecalculateRanksJob total={res.ok ? res.data.total : null} />
    </Panel>
  );
}

async function FlaggedLoader() {
  const res = await getAbnormalResults();
  if (!res.ok) {
    return <LoadError what="Flagged records" reason={res.error} bare />;
  }
  return <FlaggedRecords records={res.data} />;
}

function JobHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground [&_svg]:size-5">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-body-lg font-medium text-foreground">{title}</h3>
        <p className="text-body text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function JobLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring dark:bg-background"
    >
      <JobHeading icon={icon} title={title} description={description} />
      <span className="flex items-center gap-1 text-body font-medium text-primary">
        Open
        <ArrowRight
          className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
