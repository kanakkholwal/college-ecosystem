import { BedDouble, Circle, CircleCheck, DoorOpen } from "lucide-react";
import { Suspense } from "react";
import {
  EmptyNote,
  PanelSkeleton,
} from "@/components/application/dashboard/primitives";
import { campusFormat } from "@/components/application/hostel/ui";
import { HeaderBar } from "@/components/common/header-bar";
import { cn } from "@/lib/utils";
import {
  getHostelRooms,
  getMyAllotment,
  type MyAllotment,
} from "~/actions/hostel.allotment-process";
import { ALLOTMENT_STATUS_COPY } from "~/constants/hostel.allotment-process";
import { MyRoomPanel, RoomPicker } from "./client";

const when = (iso: string) =>
  campusFormat(iso, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export default function HostelRoomAllotmentPage() {
  return (
    <div className="@container flex flex-col gap-6">
      <HeaderBar
        Icon={BedDouble}
        titleNode="Room selection"
        descriptionNode="Pick a room when your slot opens. Residents with a higher CGPI choose first."
      />
      <Suspense fallback={<PanelSkeleton rows={4} />}>
        <AllotmentBody />
      </Suspense>
    </div>
  );
}

async function AllotmentBody() {
  const res = await getMyAllotment();
  if (res.error || !res.data) {
    return (
      <EmptyNote
        icon={<DoorOpen />}
        title={res.message || "No hostel assigned"}
        description="Room selection opens once the warden adds you to a hostel. Contact the hostel office if this looks wrong."
      />
    );
  }
  const me = res.data;
  const roomsRes = me.eligible
    ? await getHostelRooms(me.hostel._id)
    : { error: false, data: [] };

  return (
    <div className="flex flex-col gap-6">
      <Steps me={me} />
      {me.room ? (
        <MyRoomPanel room={me.room} selectionOpen={me.process === "open"} />
      ) : me.eligible ? (
        roomsRes.error ? (
          <EmptyNote
            title="Rooms couldn't load"
            description="Refresh the page to try again."
          />
        ) : (
          <RoomPicker rooms={roomsRes.data} cgpi={me.hosteler.cgpi} />
        )
      ) : (
        <EmptyNote
          icon={<DoorOpen />}
          title={me.reason ?? "You can't pick a room yet"}
          description={waitingCopy(me)}
        />
      )}
    </div>
  );
}

function waitingCopy(me: MyAllotment) {
  if (me.process !== "open") return ALLOTMENT_STATUS_COPY[me.process].effect;
  if (me.slot)
    return `Your slot opens ${when(me.slot.startingTime)}. Come back then.`;
  return "Ask the hostel office to add you to a selection slot.";
}

function Steps({ me }: { me: MyAllotment }) {
  const slotStarted =
    !me.hasSlots || (!!me.slot && new Date(me.slot.startingTime) <= new Date());
  const steps = [
    {
      label: "Selection open",
      done: me.process === "open",
      detail: ALLOTMENT_STATUS_COPY[me.process].label,
    },
    {
      label: "Your slot",
      done: slotStarted,
      detail: !me.hasSlots
        ? "No slots, open to all"
        : me.slot
          ? `${when(me.slot.startingTime)} to ${campusFormat(me.slot.endingTime, { hour: "numeric", minute: "2-digit" })}`
          : "Not in a slot",
    },
    {
      label: "Pick a room",
      done: !!me.room,
      detail: me.room
        ? `Room ${me.room.roomNumber}`
        : `CGPI ${me.hosteler.cgpi.toFixed(2)}`,
    },
  ];

  return (
    <ol
      aria-label="Your progress"
      className="grid grid-cols-1 gap-3 @2xl:grid-cols-3"
    >
      {steps.map((step, i) => (
        <li
          key={step.label}
          className={cn(
            "flex items-start gap-3 rounded-2xl border bg-card p-4 dark:bg-background",
            step.done ? "border-border" : "border-dashed border-border-strong"
          )}
        >
          {step.done ? (
            <CircleCheck
              className="mt-0.5 size-5 shrink-0 text-success"
              aria-hidden="true"
            />
          ) : (
            <Circle
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <div className="min-w-0">
            <p className="text-body font-medium text-foreground">
              {i + 1}. {step.label}
              <span className="sr-only">
                {step.done ? ", done" : ", not yet"}
              </span>
            </p>
            <p className="text-caption text-muted-foreground">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
