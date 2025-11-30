import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { getHostel } from "~/actions/hostel.core";

// UI Components
import EmptyArea from "@/components/common/empty-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HostelImporter } from "./client";

export default async function HostelRoomAllotmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const response = await getHostel(slug);
  const { success, hostel } = response;

  if (!success || !hostel) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <EmptyArea
          icons={[Building2]}
          title="Hostel Not Found"
          description={`Could not locate hostel data for slug: ${slug}`}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/admin/hostels" className="hover:text-foreground transition-colors">
            Hostels
          </Link>
          <span>/</span>
          <span>{hostel.name}</span>
          <span>/</span>
          <span className="text-foreground font-medium">Import Inventory</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Import Rooms</h1>
            <p className="text-muted-foreground mt-1">
              Bulk upload room inventory for <span className="font-semibold text-foreground">{hostel.name}</span> ({hostel.gender}) via Excel/CSV.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/admin/hostel/${slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Main Import Wizard */}
      <HostelImporter hostelId={hostel._id} />
    </div>
  );
}