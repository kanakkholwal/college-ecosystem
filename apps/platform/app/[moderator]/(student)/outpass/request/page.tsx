import RequestOutPassForm from "@/components/application/hostel/outpass-request-form";
import EmptyArea from "@/components/common/empty-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LuBuilding } from "react-icons/lu";
import { getHostelForStudent } from "~/actions/hostel.core";
import { createOutPass } from "~/actions/hostel.outpass";

interface PageProps {
  searchParams: Promise<{
    slug?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Request Outpass",
  description: "Submit a request to leave the hostel campus.",
};

export default async function RequestOutPassPage(props: PageProps) {
  const { slug } = await props.searchParams;
  const { success, message, hosteler } = await getHostelForStudent(slug);

  if (!success || !hosteler) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <EmptyArea
          icons={[LuBuilding]}
          title="Hostel Account Not Found"
          description={message || "Please contact administration."}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
            <Link href="/student/outpass">
                <ChevronLeft className="h-4 w-4" />
            </Link>
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">New Outpass Request</h1>
      </div>

      <RequestOutPassForm student={hosteler} onSubmit={createOutPass} />
    </div>
  );
}