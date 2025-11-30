import { HostelCard, HostelGridSkeleton } from "@/components/application/hostel/hostel-card";
import { ResponsiveContainer } from "@/components/common/container";
import EmptyArea from "@/components/common/empty-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { cn } from "@/lib/utils";
import {
  Building2,
  Plus,
  ShieldCheck,
  Users,
  WalletCards
} from "lucide-react";
import { getHostelsStats } from "~/actions/hostel.core";
import { CreateHostelForm, ImportFromSiteButton } from "../hostels/client";

export default async function ChiefWardenPage({ role }: { role: string }) {
  const response = await getHostelsStats();
  const hostels = response.data.hostels || [];
  const totalStudents = response.data.totalStudents || 0;

  // --- Derived Stats ---
  const totalHostels = hostels.length;
  // Assuming admins are stored in an array inside hostel object
  const totalStaff = hostels.reduce((acc, h) => acc + (h.administrators?.length || 0) + 1, 0);
  const boysHostels = hostels.filter(h => h.gender === "male").length;
  const girlsHostels = hostels.filter(h => h.gender === "female").length;

  return (
    <div className="w-full space-y-8 pb-20">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="uppercase tracking-wider font-bold text-[10px] text-primary border-primary/20 bg-primary/5">
              Campus Administration
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Chief Warden Console
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage infrastructure, appoint wardens, and oversee campus residency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hostels.length === 0 && <ImportFromSiteButton />}

          <ResponsiveDialog
            title="Commission New Hostel"
            description="Add a new building to the campus accommodation system."
            btnProps={{
              variant: "default",
              size: "sm",
              className: "gap-2 shadow-md shadow-primary/20 rounded-full px-5",
              children: (
                <>
                  <Plus className="size-4" /> Add Hostel
                </>
              ),
            }}
          >
            <CreateHostelForm />
          </ResponsiveDialog>
        </div>
      </div>

      <Separator className="opacity-50" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Hostels"
          value={totalHostels}
          icon={Building2}
          subtext={`${boysHostels} Boys • ${girlsHostels} Girls`}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatCard
          label="Total Staff"
          value={totalStaff}
          icon={ShieldCheck}
          subtext="Wardens & Admins"
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
        <StatCard
          label="Total Residents"
          value={totalStudents}
          icon={Users}
          subtext="Occupancy Rate"
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
      </div>

      {/* --- 3. Hostel Directory --- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Infrastructure Directory
          </h2>
          <div className="flex gap-2">
            {/* Filter buttons could go here */}
          </div>
        </div>

        <ErrorBoundaryWithSuspense
          loadingFallback={<HostelGridSkeleton />}
          fallback={
            <EmptyArea
              icons={[Building2]}
              title="System Error"
              description="Failed to load hostel directory."
            />
          }
        >
          {hostels.length > 0 ? (
            <ResponsiveContainer className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {hostels.map((hostel) => (
                <HostelCard
                  key={hostel.slug}
                  hostel={hostel}
                  href={`/${role}/hostels/${hostel.slug}`} disabled={false}
                />
              ))}
            </ResponsiveContainer>
          ) : (
            <div className="py-12">
              <EmptyArea
                icons={[WalletCards, Building2]}
                title="No Hostels Found"
                description="The system is currently empty. Commission a new hostel to get started."
                actionProps={{
                  children: "Import Default Hostels",
                  // Mock action for now, likely triggers the import button logic
                  onClick: () => { },
                  variant: "outline"
                }}
              />
            </div>
          )}
        </ErrorBoundaryWithSuspense>
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  subtext?: string;
  color: string;
  bg: string;
}

function StatCard({ label, value, icon: Icon, subtext, color, bg }: StatCardProps) {
  return (
    <Card className="border-border/50 shadow-sm bg-card/50">
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{label}</p>
          <h3 className="text-3xl font-bold mt-2 tabular-nums tracking-tight">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{subtext}</p>
        </div>
        <div className={cn("p-3 rounded-xl border shadow-sm", bg, color)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}