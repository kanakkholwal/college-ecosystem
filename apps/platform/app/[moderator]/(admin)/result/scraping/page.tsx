import { ArrowLeft, RadioTower } from "lucide-react";
import type { Metadata } from "next";
import {
  DashboardRoot,
  PanelSkeleton,
  SectionError,
} from "@/components/application/dashboard/primitives";
import { HeaderBar } from "@/components/common/header-bar";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { getScrapeEstimates, listScrapeTasks } from "./actions";
import { ScrapeConsole } from "./console";

export const metadata: Metadata = { title: "Scrape results" };

type PageProps = { params: Promise<{ moderator: string }> };

export default async function ScrapeResultsPage({ params }: PageProps) {
  const { moderator } = await params;
  return (
    <DashboardRoot>
      <HeaderBar
        Icon={RadioTower}
        titleNode="Scrape results"
        descriptionNode="Fetch results from the college site for a list of students. Progress streams live and stopped tasks can be resumed."
        actionNode={
          <ButtonLink href={`/${moderator}/result`} variant="outline" size="sm">
            <ArrowLeft aria-hidden="true" />
            Result tools
          </ButtonLink>
        }
      />
      <ErrorBoundaryWithSuspense
        loadingFallback={
          <div className="flex flex-col gap-10">
            <PanelSkeleton rows={4} />
            <PanelSkeleton rows={3} />
          </div>
        }
        fallback={<SectionError what="The scraper" />}
      >
        <ConsoleLoader />
      </ErrorBoundaryWithSuspense>
    </DashboardRoot>
  );
}

async function ConsoleLoader() {
  const [tasks, estimates] = await Promise.all([
    listScrapeTasks(),
    getScrapeEstimates(),
  ]);
  return (
    <ScrapeConsole
      initialTasks={tasks.ok ? tasks.data : []}
      historyError={tasks.ok ? null : `History is unavailable. ${tasks.error}`}
      estimates={estimates}
    />
  );
}
