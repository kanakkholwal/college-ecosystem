import {
  Panel,
  PanelTitle,
} from "@/components/application/dashboard/primitives";
import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CircleCheck,
  CircleDashed,
  CircleX,
  Ticket,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOutPassById } from "~/actions/hostel.outpass";
import type { OutPassType } from "~/models/hostel_n_outpass";
import { getResidentContext } from "../data";
import {
  formatIst,
  PASS_META,
  PassStatus,
  type PassState,
  passRef,
  passState,
  REASON_LABEL,
} from "../status";
import { GatePassCode } from "./gate-pass";

export const metadata: Metadata = {
  title: "Outpass",
  description: "Your gate pass and its approval timeline.",
};

type Props = { params: Promise<{ id: string; moderator: string }> };

type Pass = OutPassType & {
  rejectionReason?: string | null;
  reviewedAt?: string | Date | null;
};

export default async function OutpassDetailPage({ params }: Props) {
  const { id, moderator } = await params;
  const [resident, pass] = await Promise.all([
    getResidentContext(),
    getOutPassById(id).then((res) =>
      res.ok ? (res.data as Pass | null) : null
    ),
  ]);
  // Staff can read any pass through the action; this page only shows the viewer's own.
  if (
    !resident.ok ||
    !pass ||
    pass.student?.rollNumber !== resident.rollNumber
  ) {
    notFound();
  }

  const base = `/${moderator}/outpass`;
  const state = passState(pass);
  const scannable = state === "approved" || state === "in_use";

  return (
    <div className="@container flex w-full flex-col gap-8">
      <HeaderBar
        Icon={Ticket}
        titleNode={`${REASON_LABEL[pass.reason]}, ${pass.address}`}
        descriptionNode={
          <p>
            Pass <span className="font-mono">{passRef(pass._id)}</span>,
            requested {pass.createdAt ? formatIst(pass.createdAt) : "earlier"}.
          </p>
        }
        actionNode={
          <ButtonLink href={base} variant="outline">
            <ArrowLeft aria-hidden="true" />
            All outpasses
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-5">
        <article
          id="gate-pass"
          aria-label="Gate pass"
          className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-6 text-center dark:bg-background @3xl:col-span-3"
        >
          <PassStatus
            state={state}
            className="px-3 py-1 text-body-lg [&_svg]:size-5"
          />
          <div className="space-y-1">
            <p className="text-heading-sm font-medium text-foreground">
              {pass.student.name}
            </p>
            <p className="font-mono text-body-lg text-foreground">
              {pass.student.rollNumber}
            </p>
            <p className="text-body text-muted-foreground">
              {pass.hostel?.name}, room {pass.roomNumber}
            </p>
          </div>
          <dl className="grid w-full grid-cols-1 gap-3 text-left @md:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <dt className="text-caption text-muted-foreground">Leaving</dt>
              <dd className="text-body-lg font-medium tabular-nums text-foreground">
                {formatIst(pass.expectedOutTime)}
              </dd>
            </div>
            <div className="rounded-xl border border-border p-4">
              <dt className="text-caption text-muted-foreground">Back by</dt>
              <dd className="text-body-lg font-medium tabular-nums text-foreground">
                {formatIst(pass.expectedInTime)}
              </dd>
            </div>
          </dl>
          {scannable ? (
            <GatePassCode
              value={pass._id}
              targetId="gate-pass"
              fileName={`outpass-${pass.student.rollNumber}-${passRef(pass._id)}.png`}
            />
          ) : (
            <p className="w-full rounded-xl border border-dashed border-border px-4 py-6 text-body text-muted-foreground">
              {GATE_NOTE[state]}
            </p>
          )}
        </article>

        <Panel as="section" className="@3xl:col-span-2">
          <PanelTitle>Timeline</PanelTitle>
          <Timeline pass={pass} state={state} />
        </Panel>
      </div>
    </div>
  );
}

const GATE_NOTE: Partial<Record<PassState, string>> = {
  pending: "The gate code appears here once your warden approves the request.",
  rejected: "This request was rejected, so there is no gate code.",
  expired:
    "The return time passed before you checked out, so the gate won't accept this pass. Request a new one.",
  processed: "You're back. This pass is closed and can't be used again.",
};

type Step = {
  title: string;
  done: boolean;
  failed?: boolean;
  when?: string | Date | null;
  note?: string;
};

function Timeline({ pass, state }: { pass: Pass; state: PassState }) {
  const decided = pass.status !== "pending";
  const rejected = pass.status === "rejected";
  const steps: Step[] = [
    { title: "Requested", done: true, when: pass.createdAt },
    {
      title: rejected
        ? "Rejected"
        : decided
          ? "Approved"
          : "Waiting for approval",
      done: decided && !rejected,
      failed: rejected,
      when: decided ? pass.reviewedAt : null,
      note: rejected
        ? pass.rejectionReason
          ? `Reason: ${pass.rejectionReason}`
          : "No reason was recorded. Ask your hostel office."
        : decided
          ? undefined
          : "Your warden reviews it. Nothing to do yet.",
    },
  ];
  if (!rejected) {
    steps.push(
      {
        title: "Checked out at the gate",
        done: Boolean(pass.actualOutTime),
        when: pass.actualOutTime,
        note:
          !pass.actualOutTime && state === "expired"
            ? "Not used before the return time."
            : undefined,
      },
      {
        title: "Checked back in",
        done: Boolean(pass.actualInTime),
        when: pass.actualInTime,
        note:
          state === "in_use"
            ? `Due by ${formatIst(pass.expectedInTime)}.`
            : undefined,
      }
    );
  }

  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const Glyph = step.failed
          ? CircleX
          : step.done
            ? CircleCheck
            : CircleDashed;
        return (
          <li key={step.title} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && (
              <span
                className="absolute left-2.5 top-6 bottom-0 w-px bg-border"
                aria-hidden="true"
              />
            )}
            <Glyph
              className={cn(
                "mt-0.5 size-5 shrink-0",
                step.failed
                  ? "text-destructive"
                  : step.done
                    ? "text-success"
                    : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
            <div className="min-w-0 space-y-0.5">
              <p className="text-body font-medium text-foreground">
                {step.title}
                <span className="sr-only">
                  {step.failed
                    ? ", rejected"
                    : step.done
                      ? ", done"
                      : ", not yet"}
                </span>
              </p>
              {step.when && (
                <p className="text-caption tabular-nums text-muted-foreground">
                  {formatIst(step.when)}
                </p>
              )}
              {step.note && (
                <p className="text-body text-muted-foreground">{step.note}</p>
              )}
            </div>
          </li>
        );
      })}
      <li className="sr-only">Current status: {PASS_META[state].label}</li>
    </ol>
  );
}
