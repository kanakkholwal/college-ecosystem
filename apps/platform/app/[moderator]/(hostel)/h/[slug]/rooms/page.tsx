import EmptyArea from "@/components/common/empty-area";
import { Heading, Paragraph } from "@/components/ui/typography";
import { LuBuilding } from "react-icons/lu";
import { getHostel } from "~/actions/hostel.core";

import ImportRooms from "./client";

export default async function HostelRoomAllotmentPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const slug = (await params).slug;
  const response = await getHostel(slug);
  // console.log(response);
  const { success, hostel } = response;

  if (!success || !hostel) {
    return (
      <EmptyArea
        icons={[LuBuilding]}
        title="No Hostel Found"
        description={`Hostel with slug ${slug} not found`}
      />
    );
  }

  return (
    <div className="space-y-5 my-2">
      <div className="flex justify-between w-full">
        <div className="w-1/2">
          <Heading level={4}>{hostel.name}</Heading>
          <Paragraph className="capitalize !mt-0">
            {hostel.gender} Hostel
          </Paragraph>
        </div>
      </div>

      <ImportRooms hostelId={hostel?._id} />
    </div>
  );
}
