import { NumberTicker } from "@/components/animation/number-ticker";
import { ActionBar } from "@/components/application/action-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // If you use the footer button
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  GitBranch,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Trophy
} from "lucide-react";
import {
  assignBranchChange,
  assignRank,
  getAbnormalResults,
  getBasicInfo,
} from "./actions";
import {
  AbnormalResultsDiv,
  DeleteResultDiv,
  GetResultDiv,
  MailResultUpdateDiv,
} from "./client";
export default async function AdminResultPage() {
  const { counts, asOf } = await getBasicInfo();
  const abnormalsResults = await getAbnormalResults();

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Result Administration
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage academic records, ranks, and data integrity.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-card border rounded-2xl p-4 shadow-sm min-w-[240px]">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Records
            </p>
            <div className="flex items-baseline gap-2">
              <NumberTicker
                value={counts.results}
                className="text-3xl font-bold text-foreground"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Synced: {asOf}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Batch Operations
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <OperationCard
                 Icon={Trophy}
                title="Calculate Ranks"
                description="Re-evaluates CGPI and assigns ranks to all students across batches."
                color="text-amber-600 bg-amber-50 dark:bg-amber-950/20"
              >
                <ActionBar
                  description="" // Hidden in this layout
                  btnProps={{
                    variant: "outline",
                    size: "sm",
                    className: "w-full",
                    children: "Run Rank Assignment",
                  }}
                  action={assignRank}
                />
              </OperationCard>

              <OperationCard
                 Icon={GitBranch}
                title="Fix Branch Changes"
                description="Updates student records based on approved branch change requests."
                color="text-blue-600 bg-blue-50 dark:bg-blue-950/20"
              >
                <ActionBar
                  description=""
                  btnProps={{
                    variant: "outline",
                    size: "sm",
                    className: "w-full",
                    children: "Sync Branches",
                  }}
                  action={assignBranchChange}
                />
              </OperationCard>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Database className="h-4 w-4" /> Data Management
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Fetch Results</h4>
                    <p className="text-xs text-muted-foreground">Scrape or update from source.</p>
                  </div>
                </div>
                <div className="pt-2">
                  <GetResultDiv />
                </div>
              </div>

              <div className="bg-card border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Notifications</h4>
                    <p className="text-xs text-muted-foreground">Notify students of updates.</p>
                  </div>
                </div>
                <div className="pt-2">
                  <MailResultUpdateDiv />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Danger Zone */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Danger Zone
            </h3>
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-destructive">Delete Result Data</h4>
                  <p className="text-sm text-muted-foreground">Permanently remove result records.</p>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <DeleteResultDiv />
              </div>
            </div>
          </div>

        </div>

        {/* 3. Right Column: Data Integrity Monitor */}
        <div className="xl:col-span-1 space-y-6">

          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> System Health
            </h3>
            {abnormalsResults.length > 0 ? (
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20 gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Attention Needed
              </Badge>
            ) : (
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Healthy
              </Badge>
            )}
          </div>

          {/* Monitor Card */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">

            {/* Status Banner */}
            <div className={cn(
              "px-5 py-4 border-b flex items-start gap-3",
              abnormalsResults.length > 0
                ? "bg-amber-300/50 dark:bg-amber-950/10"
                : "bg-muted/30"
            )}>
              <div className={cn(
                "mt-0.5 shrink-0",
                abnormalsResults.length > 0 ? "text-amber-600" : "text-muted-foreground"
              )}>
                {abnormalsResults.length > 0 ? <AlertTriangle className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  {abnormalsResults.length > 0 ? "Data Anomalies Detected" : "No Anomalies Found"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {abnormalsResults.length > 0
                    ? `${abnormalsResults.length} student records have inconsistent CGPI or missing fields that require manual review.`
                    : "All student result records pass the integrity checks."}
                </p>
              </div>
            </div>

            {/* Content Area (Scrollable if list is long) */}
            <div className="flex-1 overflow-y-auto p-0">
              {/* We pass the styling responsibility to the wrapper, 
                   assuming AbnormalResultsDiv renders a clean list.
                */}
              <AbnormalResultsDiv abnormalsResults={abnormalsResults} />
            </div>

            {/* Footer Action (Contextual) */}
            {abnormalsResults.length > 0 && (
              <div className="p-3 border-t bg-muted/20">
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
                  View Detailed Report
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Helper Component for Batch Operations
// ----------------------------------------------------------------------

function OperationCard({
  Icon,
  title,
  description,
  color,
  children,
}: {
  Icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border rounded-xl p-5 flex flex-col justify-between h-full hover:border-primary/30 transition-colors">
      <div className="space-y-4 mb-6">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-base">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-auto">{children}</div>
    </div>
  );
}