import {
  EmptyNote,
  SectionError,
} from "@/components/application/dashboard/primitives";
import { HeaderBar } from "@/components/common/header-bar";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { ArrowRight, BedDouble, CircleAlert, Plus, Ticket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getOutPassForHosteler } from "~/actions/hostel.outpass";
import type { OutPassType } from "~/models/hostel_n_outpass";
import { getResidentContext } from "./data";
import { OutpassListSkeleton } from "./skeletons";
import {
  formatIst,
  PASS_META,
  PassStatus,
  type PassState,
  passRef,
  passState,
  REASON_LABEL,
} from "./status";

export const metadata: Metadata = {
  title: "Outpasses",
  description: "Request an outpass and track its approval.",
};

type Props = { params: Promise<{ moderator: string }> };

const OPEN: PassState[] = ["pending", "approved", "in_use"];

export default async function OutpassPage({ params }: Props) {
  const { moderator } = await params;
  const base = `/${moderator}/outpass`;

  return (
    <div className="@container flex w-full flex-col gap-8">
      <HeaderBar
        Icon={Ticket}
        titleNode="Outpasses"
        descriptionNode="Request a pass before you leave the hostel, then show it at the gate on the way out and back."
      />
      <ErrorBoundaryWithSuspense
        loadingFallback={<OutpassListSkeleton />}
        fallback={<SectionError what="Your outpasses" />}
      >
        <OutpassOverview base={base} />
      </ErrorBoundaryWithSuspense>
    </div>
  );
}

async function OutpassOverview({ base }: { base: string }) {
  const [resident, passes] = await Promise.all([
    getResidentContext(),
    getOutPassForHosteler().catch(() => null),
  ]);

  if (!resident.ok) {
    return (
      <EmptyNote
        icon={<BedDouble />}
        title="No hostel on your account"
        description={`${resident.error}. Outpasses are for hostel residents; contact your hostel office if you should have a room.`}
        action={
          <ButtonLink href="/" variant="outline" size="sm">
            Back to home
          </ButtonLink>
        }
      />
    );
  }
  if (!passes) return <SectionError what="Your outpasses" />;

  const now = new Date();
  const withState = passes.map((pass) => ({ pass, state: passState(pass, now) }));
  const open = withState.filter((p) => OPEN.includes(p.state));
  const blocking = withState.find(
    (p) => p.state === "pending" || p.state === "in_use"
  );

  return (
    <div className="flex flex-col gap-10">
      <section
        aria-labelledby="hostel-heading"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background @2xl:flex-row @2xl:items-center @2xl:justify-between"
      >
        <div className="min-w-0 space-y-1">
          <h2
            id="hostel-heading"
            className="text-body-lg font-medium text-foreground"
          >
            {resident.hostelName}
          </h2>
          <p className="text-body text-muted-foreground">
            Room <span className="font-mono text-foreground">{resident.roomNumber}</span>
            , roll no{" "}
            <span className="font-mono text-foreground">{resident.rollNumber}</span>
          </p>
        </div>
        {resident.ban ? null : blocking ? (
          <p className="max-w-sm text-body text-muted-foreground">
            {blocking.state === "pending"
              ? "You can request a new pass once your warden reviews the one waiting."
              : "You can request a new pass after you check back in."}
          </p>
        ) : (
          <ButtonLink href={`${base}/request`} variant="primary" size="lg">
            <Plus aria-hidden="true" />
            Request outpass
          </ButtonLink>
        )}
      </section>

      {resident.ban && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-card p-5 dark:bg-background"
        >
          <CircleAlert
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-body font-medium text-foreground">
              Outpasses are blocked
              {resident.ban.till
                ? ` until ${formatIst(resident.ban.till)}`
                : " until your warden lifts the block"}
            </p>
            <p className="text-body text-muted-foreground">
              {resident.ban.reason
                ? `Reason given: ${resident.ban.reason}.`
                : "No reason was recorded."}{" "}
              Talk to your hostel office if this looks wrong.
            </p>
          </div>
        </div>
      )}

      {open.length > 0 && (
        <section aria-labelledby="open-heading" className="flex flex-col gap-4">
          <h2
            id="open-heading"
            className="text-subheading font-medium text-foreground"
          >
            In progress
          </h2>
          <ul className="grid grid-cols-1 gap-3 @3xl:grid-cols-2">
            {open.map(({ pass, state }) => (
              <li key={pass._id}>
                <OpenPassCard pass={pass} state={state} href={`${base}/${pass._id}`} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="history-heading" className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2
            id="history-heading"
            className="text-subheading font-medium text-foreground"
          >
            Your requests
          </h2>
          {passes.length > 0 && (
            <p className="text-body text-muted-foreground">
              Your {passes.length === 10 ? "10 most recent" : passes.length}{" "}
              {passes.length === 1 ? "request" : "requests"}, newest first.
            </p>
          )}
        </div>
        {passes.length === 0 ? (
          <EmptyNote
            icon={<Ticket />}
            title="No requests yet"
            description="Each outpass you request shows up here with its approval and gate times."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card dark:bg-background">
            {withState.map(({ pass, state }) => (
              <li key={pass._id}>
                <Link
                  href={`${base}/${pass._id}`}
                  className="flex min-h-14 items-center gap-3 px-5 py-3 outline-none transition-colors duration-150 hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-medium text-foreground">
                      {REASON_LABEL[pass.reason]}, {pass.address}
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">
                      Leaving {formatIst(pass.expectedOutTime)}
                    </span>
                  </span>
                  <PassStatus state={state} />
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const NEXT_STEP: Partial<Record<PassState, (p: OutPassType) => string>> = {
  pending: () => "Waiting for your warden. You'll see the decision here.",
  approved: (p) =>
    `Show the pass at the gate when you leave. Be back by ${formatIst(p.expectedInTime)}.`,
  in_use: (p) =>
    `You're checked out. Check in at the gate by ${formatIst(p.expectedInTime)}.`,
};

function OpenPassCard({
  pass,
  state,
  href,
}: {
  pass: OutPassType;
  state: PassState;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col gap-3 rounded-2xl border bg-card p-5 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring dark:bg-background",
        state === "approved" ? "border-success/40" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-body-lg font-medium text-foreground">
            {REASON_LABEL[pass.reason]}, {pass.address}
          </h3>
          <p className="font-mono text-caption text-muted-foreground">
            Pass {passRef(pass._id)}
          </p>
        </div>
        <PassStatus state={state} />
      </div>
      <p className="text-body text-muted-foreground">
        {NEXT_STEP[state]?.(pass) ?? PASS_META[state].label}
      </p>
      <span className="mt-auto inline-flex items-center gap-1.5 text-body font-medium text-primary">
        {state === "approved" ? "Open gate pass" : "View details"}
        <ArrowRight
          className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
