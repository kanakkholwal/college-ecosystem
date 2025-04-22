import EmptyArea from "@/components/common/empty-area";
import { RouterCard } from "@/components/common/router-card";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Heading } from "@/components/ui/typography";
import ConditionalRender from "@/components/utils/conditional-render";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { LuBuilding } from "react-icons/lu";
import { getHostels } from "~/actions/hostel";

import { getSession } from "~/lib/auth-server";
import {
  CreateHostelForm,
  ImportFromSiteButton,
} from "./client";

export default async function ChiefWardenPage({params}:{
  params: Promise<{
    moderator: string
  }>;
}) {
  const { moderator } = await params;
  const response = await getHostels();
  console.log(response);
  const { success, data: hostels } = response;
  const session = await getSession();

  

  return (
    <div className="space-y-5 my-2">
      <div className="flex justify-between w-full">
        <div className="w-1/2">
          <Heading level={3}>Hostels</Heading>
        </div>
        <div className="w-1/2 flex gap-2 justify-end">
          <ResponsiveDialog
            title="Add Hostel"
            description="Add a new hostel to the system"
            btnProps={{
              variant: "default_light",
              size: "sm",
              children: "Add Hostel",
            }}
          >
            <CreateHostelForm />
          </ResponsiveDialog>
          {hostels.length === 0 && <ImportFromSiteButton />}
        </div>
      </div>

      <ErrorBoundaryWithSuspense
        fallback={
          <EmptyArea
            icons={[LuBuilding]}
            title="Error"
            description="Failed to load hostels"
          />
        }
        loadingFallback={
          <EmptyArea
            icons={[LuBuilding]}
            title="Loading..."
            description="Loading hostels..."
          />
        }
      >
        <ConditionalRender condition={hostels.length > 0}>
          <div className="grid grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 @5xl:grid-cols-4 gap-4">
            {hostels.map((hostel) => {
              const allowedEmails = hostel.administrators.map((elem) => elem.email).concat([hostel.warden.email]);
              const isUserAllowed = 
              session?.user?.email && allowedEmails.includes(session.user.email) ||
              allowedEmails.findIndex((email) => session?.user?.other_emails?.find((elem:string) => elem === email))
              || session?.user.role === "admin";


              return  <RouterCard
                key={hostel.slug}
                title={hostel.name}
                description={hostel.slug}
                href={`/${moderator}/hostels/${hostel.slug}`}
                Icon={LuBuilding}
                disabled={!isUserAllowed}
              />
})}
          </div>
        </ConditionalRender>
        <ConditionalRender condition={hostels.length === 0}>
          <EmptyArea
            icons={[LuBuilding]}
            title="No Hostel Found"
            description="There are no hostels in the system. Click the button above to add a new hostel"
          />
        </ConditionalRender>
      </ErrorBoundaryWithSuspense>
    </div>
  );
}
