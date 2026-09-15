"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import { useId, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ControlledResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { approveRejectOutPass } from "~/actions/hostel.outpass";
import { callAction } from "~/lib/call-action";

interface OutpassActionFooterProps {
  className?: string;
  outpassId: string;
  studentName?: string;
  /** Called once the server has recorded the decision. */
  onDone?: (decision: "approved" | "rejected") => void;
}

const QUICK_REASONS = [
  "Return time is past the hostel curfew",
  "Destination address is incomplete",
  "Parent confirmation needed",
];

// Never optimistic: the row only leaves the queue after the server confirms.
export function OutpassActionFooter({
  className,
  outpassId,
  studentName,
  onDone,
}: OutpassActionFooterProps) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const reasonId = useId();

  const decide = async (action: "approve" | "reject") => {
    setBusy(action);
    const res = await callAction(() =>
      approveRejectOutPass(
        outpassId,
        action,
        action === "reject" ? reason : undefined
      )
    );
    setBusy(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(res.data);
    setRejectOpen(false);
    onDone?.(action === "approve" ? "approved" : "rejected");
  };

  const who = studentName ? ` for ${studentName}` : "";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant="primary"
        onClick={() => decide("approve")}
        disabled={busy !== null}
        aria-label={`Approve outpass${who}`}
      >
        {busy === "approve" ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Check aria-hidden="true" />
        )}
        {busy === "approve" ? "Approving" : "Approve"}
      </Button>
      <Button
        variant="outline"
        onClick={() => setRejectOpen(true)}
        disabled={busy !== null}
        aria-label={`Reject outpass${who}`}
      >
        <X aria-hidden="true" />
        Reject
      </Button>

      <ControlledResponsiveDialog
        open={rejectOpen}
        onOpenChange={(open) => busy === null && setRejectOpen(open)}
        title={`Reject this outpass${who}?`}
        description="The student sees your reason and can send a new request."
      >
        <form
          className="flex flex-col gap-3 pb-4"
          onSubmit={(event) => {
            event.preventDefault();
            decide("reject");
          }}
        >
          <label
            htmlFor={reasonId}
            className="text-body font-medium text-foreground"
          >
            Reason
          </label>
          <Textarea
            id={reasonId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
            required
            placeholder="Tell the student what to change"
          />
          <div className="flex flex-wrap gap-2">
            {QUICK_REASONS.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => setReason(text)}
                className="h-8 rounded-lg border border-border px-2.5 text-caption text-foreground outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                {text}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRejectOpen(false)}
              disabled={busy !== null}
            >
              Keep pending
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={busy !== null || reason.trim().length < 3}
            >
              {busy === "reject" && (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              )}
              Reject outpass
            </Button>
          </div>
        </form>
      </ControlledResponsiveDialog>
    </div>
  );
}
