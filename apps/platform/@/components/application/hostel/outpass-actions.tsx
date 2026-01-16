"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { approveRejectOutPass } from "~/actions/hostel.outpass";

interface OutpassActionFooterProps {
  className?: string;
  outpassId: string;
}
const ACTIONS = {
  approve: "approve",
  reject: "reject",
} as const;

export function OutpassActionFooter({
  className,
  outpassId,
}: OutpassActionFooterProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = () => {
    setIsApproving(true);
    toast
      .promise(approveRejectOutPass(outpassId, ACTIONS.approve), {
        loading: "Approving...",
        success: "Approved successfully",
        error: "An error occurred while approving",
      })
      .finally(() => {
        setIsApproving(false);
      });
  };

  const handleReject = () => {
    setIsRejecting(true);
    toast
      .promise(approveRejectOutPass(outpassId, ACTIONS.reject), {
        loading: "Rejecting...",
        success: "Rejected successfully",
        error: "An error occurred while rejecting",
      })
      .finally(() => {
        setIsRejecting(false);
      });
  };

  return (
    <div className={cn("flex space-x-2 mt-2", className)}>
      <Button
        size="sm"
        variant="default_soft"
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
      >
        {isApproving ? <LoaderCircle className="animate-spin" /> : <Check />}
        {isApproving ? "Approving..." : "Approve"}
      </Button>
      <Button
        size="sm"
        variant="destructive_soft"
        onClick={handleReject}
        disabled={isApproving || isRejecting}
      >
        {isRejecting ? <LoaderCircle className="animate-spin" /> : <X />}
        {isRejecting ? "Rejecting..." : "Reject"}
      </Button>
    </div>
  );
}
