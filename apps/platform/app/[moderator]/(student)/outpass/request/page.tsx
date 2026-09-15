import { EmptyNote } from "@/components/application/dashboard/primitives";
import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, BedDouble, CircleAlert, Ticket } from "lucide-react";
import type { Metadata } from "next";
import { getOutPassForHosteler } from "~/actions/hostel.outpass";
import { getResidentContext } from "../data";
import { formatIst, passRef } from "../status";
import { RequestOutpassForm } from "./request-form";

export const metadata: Metadata = {
  title: "Request outpass",
  description: "Ask your warden for permission to leave the hostel.",
};

type Props = { params: Promise<{ moderator: string }> };

export default async function RequestOutpassPage({ params }: Props) {
  const { moderator } = await params;
  const base = `/${moderator}/outpass`;
  const [resident, passes] = await Promise.all([
    getResidentContext(),
    getOutPassForHosteler().then((res) => (res.ok ? res.data : [])),
  ]);
  const blocking = passes.find(
    (p) => p.status === "pending" || p.status === "in_use"
  );
  const back = (
    <ButtonLink href={base} variant="outline">
      <ArrowLeft aria-hidden="true" />
      All outpasses
    </ButtonLink>
  );

  return (
    <div className="@container flex w-full flex-col gap-8">
      <HeaderBar
        Icon={Ticket}
        titleNode="Request an outpass"
        descriptionNode="Your warden reviews the request. The decision shows on your outpasses page."
        actionNode={back}
      />
      <div className="mx-auto w-full max-w-2xl">
        {!resident.ok ? (
          <EmptyNote
            icon={<BedDouble />}
            title="No hostel on your account"
            description={`${resident.error}. Contact your hostel office if you should have a room.`}
          />
        ) : resident.ban ? (
          <EmptyNote
            icon={<CircleAlert />}
            title="Outpasses are blocked"
            description={`${resident.ban.till ? `Blocked until ${formatIst(resident.ban.till)}.` : "Blocked until your warden lifts it."} ${resident.ban.reason ? `Reason given: ${resident.ban.reason}.` : ""}`}
          />
        ) : blocking ? (
          <EmptyNote
            icon={<Ticket />}
            title={
              blocking.status === "pending"
                ? "A request is already waiting"
                : "You're checked out on a pass"
            }
            description={
              blocking.status === "pending"
                ? "You can request another once your warden reviews it."
                : "Check back in at the gate first, then request a new pass."
            }
            action={
              <ButtonLink
                href={`${base}/${blocking._id}`}
                variant="primary"
                size="sm"
              >
                Open pass {passRef(blocking._id)}
              </ButtonLink>
            }
          />
        ) : (
          <div className="rounded-2xl border border-border bg-card p-5 dark:bg-background @md:p-6">
            <RequestOutpassForm
              roomNumber={resident.roomNumber}
              phoneNumber={resident.phoneNumber}
              successHref={base}
            />
          </div>
        )}
      </div>
    </div>
  );
}
