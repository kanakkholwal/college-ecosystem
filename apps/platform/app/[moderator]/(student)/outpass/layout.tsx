import { HostelDetailsForNonAdmins } from "@/components/application/hostel/hostel-details";
import EmptyArea from "@/components/common/empty-area";
import { Separator } from "@/components/ui/separator";
import ConditionalRender from "@/components/utils/conditional-render";
import { LuBuilding } from "react-icons/lu";
import { getHostelByUser } from "~/actions/hostel";

export default async function HostelPageLayout(props: {
  children: React.ReactNode;
}) {
  const { success, message, hostel, hosteler } = await getHostelByUser();

  if (!success || !hostel || !hosteler) {
    return (
      <EmptyArea
        icons={[LuBuilding]}
        title="No Hostel Found for this user"
        description={message}
      />
    );
  }

  return (
    <div className="space-y-5">
      <HostelDetailsForNonAdmins hostel={hostel} />
      <Separator />
      <ConditionalRender condition={hosteler?.banned}>
        <EmptyArea
          icons={[LuBuilding]}
          title="You are banned from requesting outpass for the following reason"
          description={`${hosteler.bannedReason} till ${hosteler.bannedTill ? new Date(hosteler.bannedTill).toLocaleString() : "N/A"}`}
        />
      </ConditionalRender>
      <ConditionalRender condition={!hosteler?.banned}>
        {props.children}
      </ConditionalRender>
    </div>
  );
}
