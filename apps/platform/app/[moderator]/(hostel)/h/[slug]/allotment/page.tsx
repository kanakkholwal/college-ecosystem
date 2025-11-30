import { StatsCard } from "@/components/application/stats-card";
import { ResponsiveContainer } from "@/components/common/container";
import EmptyArea from "@/components/common/empty-area";
import { Badge } from "@/components/ui/badge";
import { Heading, Paragraph } from "@/components/ui/typography";
import { LuBuilding } from "react-icons/lu";
import {
  getAllotmentProcess,
  getHostelRooms,
} from "~/actions/hostel.allotment-process";
import { getHostel } from "~/actions/hostel.core";
import {
  ChangeAllotmentProcessStatusButton,
  DistributeSlotsButton,
  DownloadSlotButton,
  RoomsTable,
} from "./client";

import {
  SLOT_CAPACITY,
  SLOT_DURATION,
  SLOT_TIME_GAP,
} from "~/constants/hostel.allotment-process";

export default async function HostelRoomAllotmentPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const slug = (await params).slug;
  const response = await getHostel(slug);
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

  const allotmentProcess = await getAllotmentProcess(hostel._id);
  console.log("allotment process from admin:", allotmentProcess);
  const hostelRoomsResponse = await getHostelRooms(hostel._id);
  if (hostelRoomsResponse.error) {
    console.log(hostelRoomsResponse.message);
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

      <ResponsiveContainer>
        <StatsCard title="Allotment Process">
          <p className="text-xs text-muted-foreground">
            Allotment process is{" "}
            <Badge variant="link" size="sm" className="capitalize">
              {allotmentProcess?.status}
            </Badge>{" "}
            for this hostel
          </p>

          <ChangeAllotmentProcessStatusButton
            currentStatus={allotmentProcess?.status}
            hostelId={hostel._id}
          />
        </StatsCard>
        <StatsCard title="Allotment Slots">
          <p className="text-xs text-muted-foreground">
            Create slots for allotment process with duration of {SLOT_DURATION}
            min with gap of {SLOT_TIME_GAP}min and capacity of {SLOT_CAPACITY}{" "}
            students per slot
          </p>

          <DistributeSlotsButton hostelId={hostel._id} />
          <DownloadSlotButton hostelId={hostel._id} />
        </StatsCard>
      </ResponsiveContainer>

      <div className="w-full ">
        <Heading level={4} className="mb-2">
          Manual Check
        </Heading>
        <Paragraph className="text-muted-foreground">
          Allotment process is
          <Badge variant="default_light" size="sm" className="capitalize mx-1">
            {allotmentProcess?.status}
          </Badge>{" "}
          for this hostel
        </Paragraph>

        <RoomsTable rooms={hostelRoomsResponse.data} />
      </div>
    </div>
  );
}
