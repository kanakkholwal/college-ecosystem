import { CalendarClock, ChartNoAxesColumn } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  DashboardSection,
  EmptyNote,
  Panel,
  PanelSkeleton,
  SectionError,
} from "@/components/application/dashboard/primitives";
import {
  campusFormat,
  StatTile,
  TableFrame,
  Td,
  Th,
} from "@/components/application/hostel/ui";
import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import {
  getAllotmentProcess,
  getHostelRooms,
  getUpcomingSlots,
} from "~/actions/hostel.allotment-process";
import { ALLOTMENT_STATUS_COPY as STATUS_COPY } from "~/constants/hostel.allotment-process";
import { authorizeHostelManager } from "~/lib/hostel-access";
import { ProcessControl, SlotActions } from "./client";

const slotTime = (iso: string) =>
  campusFormat(iso, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export default async function AllotmentPage({
  params,
}: {
  params: Promise<{ moderator: string; slug: string }>;
}) {
  const { moderator, slug } = await params;
  const access = await authorizeHostelManager(slug);
  if (!access.ok) notFound();
  const hostelId = access.hostel._id.toString();

  return (
    <div className="@container flex flex-col gap-10">
      <HeaderBar
        Icon={ChartNoAxesColumn}
        titleNode="Room selection"
        descriptionNode="Residents pick rooms in CGPI order during their slot. Control when selection is open."
        actionNode={
          <ButtonLink href={`/${moderator}/h/${slug}/rooms`} variant="outline">
            Manage rooms
          </ButtonLink>
        }
      />
      <Suspense fallback={<PanelSkeleton rows={4} />}>
        <AllotmentBody hostelId={hostelId} />
      </Suspense>
    </div>
  );
}

async function AllotmentBody({ hostelId }: { hostelId: string }) {
  const [processRes, slotsRes, roomsRes] = await Promise.all([
    getAllotmentProcess(hostelId),
    getUpcomingSlots(hostelId),
    getHostelRooms(hostelId),
  ]);
  if (!processRes.ok || !slotsRes.ok || !roomsRes.ok) {
    return <SectionError what="Room selection" />;
  }
  const process = processRes.data;
  const slots = slotsRes.data;
  const rooms = roomsRes.data;
  const beds = rooms.reduce((a, r) => a + r.capacity, 0);
  const taken = rooms.reduce((a, r) => a + r.occupied_seats, 0);
  const inSlots = slots.reduce((a, s) => a + s.students, 0);
  const now = Date.now();

  return (
    <>
      <Panel as="section" className="flex flex-col gap-5">
        <div className="space-y-1">
          <h2 className="text-subheading font-medium text-foreground">
            Status: {STATUS_COPY[process.status].label}
          </h2>
          <p className="text-body text-muted-foreground">
            {STATUS_COPY[process.status].effect}
          </p>
          {process.notice && (
            <p role="status" className="text-body text-destructive">
              {process.notice}
            </p>
          )}
        </div>
        <ProcessControl hostelId={hostelId} current={process.status} />
      </Panel>

      <section
        aria-label="Selection totals"
        className="grid grid-cols-2 gap-3 @3xl:grid-cols-4"
      >
        <StatTile label="Rooms" value={rooms.length} />
        <StatTile label="Free beds" value={Math.max(0, beds - taken)} />
        <StatTile label="Slots" value={slots.length} />
        <StatTile label="Residents in slots" value={inSlots} />
      </section>

      <DashboardSection
        id="slots"
        title="Selection slots"
        description="Each slot opens selection for a group of residents; earlier slots go to higher CGPI."
        action={
          <SlotActions
            hostelId={hostelId}
            hasSlots={slots.length > 0}
            processOpen={process.status === "open"}
          />
        }
      >
        {slots.length === 0 ? (
          <EmptyNote
            icon={<CalendarClock />}
            title="No slots yet"
            description={
              rooms.length === 0
                ? "Import rooms first, then generate slots from the resident list."
                : "Without slots, every resident can pick as soon as selection opens."
            }
          />
        ) : (
          <TableFrame caption="Selection slots">
            <thead>
              <tr>
                <Th className="w-16">Slot</Th>
                <Th>Starts</Th>
                <Th>Ends</Th>
                <Th>Residents</Th>
                <Th>State</Th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, i) => {
                const start = new Date(slot.startingTime).getTime();
                const end = new Date(slot.endingTime).getTime();
                const state =
                  now < start
                    ? "Upcoming"
                    : now <= end
                      ? "Running"
                      : "Started earlier";
                return (
                  <tr key={slot._id} className="group/row">
                    <Td className="tabular-nums">{i + 1}</Td>
                    <Td className="whitespace-nowrap tabular-nums">
                      {slotTime(slot.startingTime)}
                    </Td>
                    <Td className="whitespace-nowrap tabular-nums">
                      {slotTime(slot.endingTime)}
                    </Td>
                    <Td className="tabular-nums">{slot.students}</Td>
                    <Td
                      className={
                        state === "Running"
                          ? "font-medium text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {state}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableFrame>
        )}
      </DashboardSection>
    </>
  );
}
