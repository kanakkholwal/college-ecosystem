import EmptyArea from "@/components/common/empty-area";
import { Heading, Paragraph } from "@/components/ui/typography";
import { LuBuilding } from "react-icons/lu";
// import { IN_CHARGES_EMAILS } from "~/constants/hostel_n_outpass"
import { getHostelByUser } from "~/actions/hostel";
import type { Session } from "~/lib/auth";
import { getSession } from "~/lib/auth-server";

interface PageProps {
  searchParams: Promise<{
    slug?: string;
  }>;
}

export default async function OutPassRequestsPage(props: PageProps) {
  const { slug } = await props.searchParams;
  const session = (await getSession()) as Session;
  const { success, message, hostel } = await getHostelByUser(slug);

  if (!success || !hostel) {
    return (
      <EmptyArea
        icons={[LuBuilding]}
        title="No Hostel Found for this user"
        description={message}
      />
    );
  }

  return (
    <div className="space-y-5 my-2">
      <div className="flex justify-between w-full">
        <div className="w-1/2">
          <Heading level={3} className="font-bold text-gray-800">
            {hostel.name}
          </Heading>
          <Paragraph className="capitalize mt-0!">
            Warden: {hostel.warden.name}{" "}
            <span className="lowercase">({hostel.warden.email})</span>
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
