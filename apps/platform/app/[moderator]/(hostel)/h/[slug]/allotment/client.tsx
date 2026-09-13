"use client";

import { Download, LoaderCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ControlledResponsiveDialog } from "@/components/ui/responsive-dialog";
import { cn } from "@/lib/utils";
import {
  distributeSlots,
  updateAllotmentProcess,
} from "~/actions/hostel.allotment-process";
import {
  ALLOTMENT_STATUSES,
  type AllotmentStatus,
  ALLOTMENT_STATUS_COPY as STATUS_COPY,
} from "~/constants/hostel.allotment-process";

export function ProcessControl({
  hostelId,
  current,
}: {
  hostelId: string;
  current: AllotmentStatus;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<AllotmentStatus | null>(null);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!target) return;
    setBusy(true);
    try {
      const res = await updateAllotmentProcess(hostelId, {
        status: target,
        hostelId,
      });
      if (res.error) toast.error(res.message);
      else {
        toast.success(
          `Room selection is now ${STATUS_COPY[target].label.toLowerCase()}`
        );
        setTarget(null);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-body font-medium text-foreground">
          Change status
        </legend>
        <div className="flex flex-wrap gap-2">
          {ALLOTMENT_STATUSES.map((status) => (
            <Button
              key={status}
              variant={status === current ? "outline" : "ghost"}
              aria-pressed={status === current}
              disabled={status === current}
              onClick={() => setTarget(status)}
              className={cn(
                status === current &&
                  "border-primary bg-primary/10 text-primary disabled:opacity-100"
              )}
            >
              {STATUS_COPY[status].label}
            </Button>
          ))}
        </div>
      </fieldset>
      <ControlledResponsiveDialog
        open={target !== null}
        onOpenChange={(open) => !busy && !open && setTarget(null)}
        title={
          target
            ? `Set selection to ${STATUS_COPY[target].label.toLowerCase()}?`
            : ""
        }
        description={target ? STATUS_COPY[target].effect : undefined}
        hideClose
      >
        <div className="flex justify-end gap-2 pb-4">
          <Button
            variant="ghost"
            onClick={() => setTarget(null)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={confirm} disabled={busy}>
            {busy && (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            )}
            Confirm
          </Button>
        </div>
      </ControlledResponsiveDialog>
    </>
  );
}

export function SlotActions({
  hostelId,
  hasSlots,
  processOpen,
}: {
  hostelId: string;
  hasSlots: boolean;
  processOpen: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<"generate" | "download" | null>(null);

  const generate = async () => {
    setBusy("generate");
    try {
      const res = await distributeSlots(hostelId);
      if (res.error) toast.error(res.message);
      else {
        toast.success(res.message);
        setConfirming(false);
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  };

  const download = async () => {
    setBusy("download");
    try {
      const res = await fetch(
        `/api/hostel/allotment-slot?hostelId=${encodeURIComponent(hostelId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error();
      const body = (await res.json()) as {
        hostel: string;
        data: {
          slotNumber: number;
          slotTiming: string;
          slotRollNumbers: string[];
          slotNames: string[];
        }[];
      };
      const quote = (v: string | number) =>
        `"${String(v).replace(/"/g, '""')}"`;
      const lines = [
        ["Slot", "Timing", "Roll number", "Name"].map(quote).join(","),
      ];
      for (const slot of body.data) {
        slot.slotRollNumbers.forEach((roll, i) => {
          lines.push(
            [slot.slotNumber, slot.slotTiming, roll, slot.slotNames[i] ?? ""]
              .map(quote)
              .join(",")
          );
        });
      }
      const url = URL.createObjectURL(
        new Blob([lines.join("\n")], { type: "text/csv" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${body.hostel.replace(/\s+/g, "_")}_slots.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn't download the schedule");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={hasSlots ? "outline" : "primary"}
        onClick={() => setConfirming(true)}
        disabled={busy !== null}
      >
        <RefreshCw aria-hidden="true" />
        {hasSlots ? "Regenerate slots" : "Generate slots"}
      </Button>
      {hasSlots && (
        <Button variant="outline" onClick={download} disabled={busy !== null}>
          {busy === "download" ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Download aria-hidden="true" />
          )}
          Download schedule
        </Button>
      )}
      <ControlledResponsiveDialog
        open={confirming}
        onOpenChange={(open) => busy === null && setConfirming(open)}
        title={hasSlots ? "Replace every slot?" : "Generate slots?"}
        description={
          processOpen
            ? "Selection is open. New slots start from the next half hour, so residents mid-slot may have to wait."
            : "Residents are ordered by CGPI, highest first, and grouped into slots starting from the next half hour."
        }
        hideClose
      >
        <div className="flex justify-end gap-2 pb-4">
          <Button
            variant="ghost"
            onClick={() => setConfirming(false)}
            disabled={busy !== null}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={generate} disabled={busy !== null}>
            {busy === "generate" && (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            )}
            {hasSlots ? "Replace slots" : "Generate"}
          </Button>
        </div>
      </ControlledResponsiveDialog>
    </div>
  );
}
