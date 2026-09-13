import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { LayoutDashboard, TriangleAlert } from "lucide-react";
import type React from "react";
import AdminDashboard from "./admin.dashboard";
import ChiefWardenDashboard from "./chief_warden.dashboard";
import CRDashboard from "./cr.dashboard";
import FacultyDashboard from "./faculty.dashboard";
import GuardDashboard from "./guard.dashboard";
import StudentDashboard from "./student.dashboard";
import WardenDashboard from "./warden.dashboard";

type DashboardComponentProps = {
  role: string;
  searchParams: Record<string, string | undefined>;
};

type DashboardComponent = (
  props: DashboardComponentProps
) => React.ReactNode | Promise<React.ReactNode>;

const dashboard_templates: Record<string, DashboardComponent> = {
  admin: AdminDashboard,
  cr: CRDashboard,
  faculty: FacultyDashboard,
  guard: GuardDashboard,
  student: StudentDashboard,
  warden: WardenDashboard,
  assistant_warden: WardenDashboard,
  chief_warden: ChiefWardenDashboard,
};

interface DashboardTemplateProps {
  user_role: string;
  searchParams: Record<string, string | undefined>;
}

export function DashboardTemplate({
  user_role,
  searchParams,
}: DashboardTemplateProps) {
  const DashboardComponent = Object.hasOwn(dashboard_templates, user_role)
    ? dashboard_templates[user_role]
    : null;

  if (!DashboardComponent) {
    return (
      <DashboardNotice
        tone="empty"
        title="No dashboard for this role yet"
        description="Use the sidebar to reach the tools your role can open."
      />
    );
  }

  return (
    <ErrorBoundaryWithSuspense
      fallback={
        <DashboardNotice
          tone="error"
          title="This dashboard failed to load"
          description="Reload the page to try again. Other sections in the sidebar still work."
        />
      }
      loadingFallback={<DashboardSkeleton />}
    >
      <DashboardComponent role={user_role} searchParams={searchParams} />
    </ErrorBoundaryWithSuspense>
  );
}

function DashboardNotice({
  tone,
  title,
  description,
}: {
  tone: "empty" | "error";
  title: string;
  description: string;
}) {
  const Glyph = tone === "error" ? TriangleAlert : LayoutDashboard;
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center dark:bg-background">
      <span
        className={
          tone === "error"
            ? "grid size-10 place-items-center rounded-lg border border-border bg-background text-destructive"
            : "grid size-10 place-items-center rounded-lg border border-border bg-background text-muted-foreground"
        }
      >
        <Glyph className="size-5" aria-hidden="true" />
      </span>
      <h1 className="text-body-lg font-medium text-foreground">{title}</h1>
      <p className="max-w-sm text-pretty text-body text-muted-foreground">
        {description}
      </p>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <Skeleton className="h-8 w-56 max-w-full bg-muted" />
        <Skeleton className="h-4 w-80 max-w-full bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton key={key} className="h-28 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl bg-muted lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
