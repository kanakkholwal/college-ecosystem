import { HostelCard, HostelGridSkeleton } from "@/components/application/hostel/hostel-card";
import EmptyArea from "@/components/common/empty-area";
import { HeaderBar } from "@/components/common/header-bar";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import ConditionalRender from "@/components/utils/conditional-render";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import {
  AlertCircle,
  Building2,
  Plus
} from "lucide-react";
import { MdRoom } from "react-icons/md";
import { getHostels } from "~/actions/hostel.core";
import { getSession } from "~/auth/server";
import { CreateHostelForm, ImportFromSiteButton } from "./client";

export default async function ChiefWardenPage({
  params,
}: {
  params: Promise<{
    moderator: string;
  }>;
}) {
  const { moderator } = await params;
  const response = await getHostels();
  const { success, data: hostels } = response;

  const session = await getSession();

  return (
    <div className="space-y-8 my-6 w-full max-w-[1600px] mx-auto px-4 sm:px-6">
      <HeaderBar
        Icon={MdRoom}
        titleNode={
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Hostel Directory</h1>
            <Badge variant="secondary" className="rounded-full px-2.5 bg-muted text-muted-foreground border-border">
              {hostels?.length || 0} Properties
            </Badge>
          </div>
        }
        descriptionNode="Manage campus housing, wardens, and room configurations across the ecosystem."
        actionNode={
          <div className="flex items-center gap-2">
            {hostels?.length === 0 && <ImportFromSiteButton />}
            <ResponsiveDialog
              title="Add New Hostel"
              description="Configure a new hostel block in the system."
              btnProps={{
                variant: "default",
                size: "sm",
                className: "gap-2 shadow-sm",
                children: (
                  <>
                    <Plus className="h-4 w-4" /> Add Hostel
                  </>
                ),
              }}
            >
              <CreateHostelForm />
            </ResponsiveDialog>
          </div>
        }
      />

      <ErrorBoundaryWithSuspense
        fallback={
          <EmptyArea
            icons={[AlertCircle]}
            title="System Error"
            description="Failed to load hostel data. Please check your network or permissions."
            className="border-destructive/50 bg-destructive/5 text-destructive"
          />
        }
        loadingFallback={<HostelGridSkeleton />}
      >
        <ConditionalRender condition={!!hostels && hostels.length > 0}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hostels?.map((hostel: any) => {
              // --- Access Control Logic ---
              const allowedEmails = hostel.administrators
                .map((elem: any) => elem.email)
                .concat([hostel.warden.email]);

              const userEmail = session?.user?.email;
              const userOtherEmails = session?.user?.other_emails || [];
              const isAdmin = session?.user.role === "admin";

              const isUserAllowed =
                isAdmin ||
                (userEmail && allowedEmails.includes(userEmail)) ||
                allowedEmails.some((email: string) => userOtherEmails.includes(email));

              return (
                <HostelCard
                  key={hostel.slug}
                  hostel={hostel}
                  href={`/${moderator}/h/${hostel.slug}`}
                  disabled={!isUserAllowed}
                />
              );
            })}
          </div>
        </ConditionalRender>

        <ConditionalRender condition={!hostels || hostels.length === 0}>

          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 />
              </EmptyMedia>
              <EmptyTitle>No Hostels Configured</EmptyTitle>
              <EmptyDescription>
                Your campus housing ecosystem is empty. Start by adding your first hostel block.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <ResponsiveDialog
                title="Add New Hostel"
                description="Configure a new hostel block."
                btnProps={{ children: "Create First Hostel" }}
              >
                <CreateHostelForm />
              </ResponsiveDialog>
            </EmptyContent>
          </Empty>
        </ConditionalRender>
      </ErrorBoundaryWithSuspense>
    </div>
  );
}


