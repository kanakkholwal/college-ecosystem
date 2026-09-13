import { cn } from "@/lib/utils";
import {
  CheckCheck,
  CircleCheck,
  CircleSlash,
  CircleX,
  Clock,
  LogOut,
} from "lucide-react";
import type { OutPassType } from "~/models/hostel_n_outpass";

export type PassState =
  | "pending"
  | "approved"
  | "expired"
  | "rejected"
  | "in_use"
  | "processed";

type PassLike = Pick<OutPassType, "status" | "expectedInTime">;

/** The gate refuses an approved pass once its return time has passed, so show it as expired. */
export function passState(pass: PassLike, now = new Date()): PassState {
  if (
    pass.status === "approved" &&
    new Date(pass.expectedInTime).getTime() <= now.getTime()
  ) {
    return "expired";
  }
  return pass.status;
}

export const PASS_META: Record<
  PassState,
  { label: string; Glyph: typeof Clock; tone: string }
> = {
  pending: {
    label: "Awaiting approval",
    Glyph: Clock,
    tone: "border-border-strong text-foreground",
  },
  approved: {
    label: "Approved",
    Glyph: CircleCheck,
    tone: "border-success/40 text-success",
  },
  expired: {
    label: "Expired",
    Glyph: CircleSlash,
    tone: "border-border text-muted-foreground",
  },
  rejected: {
    label: "Rejected",
    Glyph: CircleX,
    tone: "border-destructive/40 text-destructive",
  },
  in_use: {
    label: "Checked out",
    Glyph: LogOut,
    tone: "border-info/40 text-info",
  },
  processed: {
    label: "Returned",
    Glyph: CheckCheck,
    tone: "border-border text-muted-foreground",
  },
};

export function PassStatus({
  state,
  className,
}: {
  state: PassState;
  className?: string;
}) {
  const { label, Glyph, tone } = PASS_META[state];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-caption font-medium",
        tone,
        className
      )}
    >
      <Glyph className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

export const REASON_LABEL: Record<OutPassType["reason"], string> = {
  outing: "Outing",
  market: "Market",
  medical: "Medical",
  home: "Going home",
  other: "Other",
};

const istFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

/** "Sat, 14 Sept, 5:30 pm IST" in campus time on server and client alike. */
export const formatIst = (value: Date | string) =>
  `${istFormat.format(new Date(value))} IST`;

export const passRef = (id: string) => id.slice(-6).toUpperCase();
