import AdUnit from "@/components/common/adsense";
import EmptyArea from "@/components/common/empty-area";
// import { BannerPanel } from "@/components/utils/banner";
// import ConditionalRender from "@/components/utils/conditional-render";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { SkeletonCardArea } from "@/components/utils/skeleton-cards";
// import { RocketIcon } from "@radix-ui/react-icons";
import React from "react";
import AdminDashboard from "./admin.dashboard";
import ChiefWardenDashboard from "./chief_warden.dashboard";
import CRDashboard from "./cr.dashboard";
import GuardDashboard from "./guard.dashboard";
import StudentDashboard from "./student.dashboard";
import WardenDashboard from "./warden.dashboard";

type DashboardComponentProps = {
  role: string;
  searchParams: Record<string, string | undefined>;
};
type DashboardTemplateType = Promise<React.ReactNode> | React.FC<DashboardComponentProps>;

const dashboard_templates = new Map<string, DashboardTemplateType>([
  ["admin", AdminDashboard],
  ["cr", CRDashboard],
  ["guard", GuardDashboard],
  ["student", StudentDashboard],
  ["warden", WardenDashboard],
  ["assistant_warden", WardenDashboard],
  ["chief_warden", ChiefWardenDashboard],
]);

interface DashboardTemplateProps {
  user_role: string;
  searchParams: Record<string, string | undefined>;
}

export function DashboardTemplate({ user_role, searchParams }: DashboardTemplateProps) {
  if (dashboard_templates.has(user_role)) {
    const DashboardComponent = dashboard_templates.get(user_role) as React.FC<DashboardComponentProps>;
    if (DashboardComponent) {
      return (
        <>
          {/* <ConditionalRender condition={user_role === "student"}>
            <BannerPanel
               Icon={<RocketIcon className="size-4 text-muted-foreground" />}
              isClosable={true}
              className="rounded-xl bg-card"
              title="Suggest a Feature"
              description=" We are changing the way you interact with the platform and adding new features."
              redirectUrl="https://forms.gle/v8Angn9VCbt9oVko7"
              btnProps={{
                children: "Suggest a feature here",
                variant: "default_soft",
              }}
            />
          </ConditionalRender> */}
          <AdUnit adSlot="display-horizontal" key={"dashboard-page-ad-" + user_role} />
          <ErrorBoundaryWithSuspense
            loadingFallback={
              <SkeletonCardArea
                className="mx-auto"
                skeletonClassName="bg-muted"
              />
            }
          >
            <DashboardComponent role={user_role} searchParams={searchParams} />
          </ErrorBoundaryWithSuspense>
        </>
      );
    }
  }
  return (
    <EmptyArea
      title="No Dashboard"
      description="Looks like you are not assigned to any dashboard yet."
    />
  );
}
