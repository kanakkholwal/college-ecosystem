import EmptyArea from "@/components/common/empty-area";
import { Separator } from "@/components/ui/separator";
import { Building2, DoorClosed, User } from "lucide-react";
import { getHostelForStudent } from "~/actions/hostel.core";

export default async function HostelPageLayout(props: {
  children: React.ReactNode;
}) {
  const response = await getHostelForStudent();

  if (!response.success || !response.hostel || !response.hosteler) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <EmptyArea
          icons={[Building2]}
          title="No Hostel Assigned"
          description="You do not appear to be assigned to any hostel. Please contact the warden or administration."
        />
      </div>
    );
  }

  const { hostel, hosteler } = response;

  return (
    <div className="space-y-6">
      {/* Persistent Context Header */}
      <div className="flex flex-wrap justify-between gap-4 md:items-center pr-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{hostel.name}</h2>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <span className="capitalize">{hostel.gender} Hostel</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" /> {hosteler.rollNumber}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2 shadow-sm grow-0 max-w-fit">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">Room</span>
            <span className="font-mono text-xl font-bold leading-none">{hosteler.roomNumber}</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <DoorClosed className="text-muted-foreground" />
        </div>
      </div>

      <Separator />

      <div className="min-h-[60vh]">
        {props.children}
      </div>
    </div>
  );
}