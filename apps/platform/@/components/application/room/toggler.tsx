"use client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Toggle({
  currentStatus,
  roomNumber,
  updateStatus,
}: {
  currentStatus: "available" | "occupied";
  roomNumber: string;
  updateStatus: (
    roomNumber: string,
    status: "available" | "occupied"
  ) => Promise<boolean>;
}) {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="currentStatus"
        disabled={loading}
        checked={currentStatus === "available"}
        onCheckedChange={(checked) => {
          setLoading(true);
          toast.promise(
            updateStatus(roomNumber, checked ? "available" : "occupied"),
            {
              loading: `Updating ${roomNumber} status...`,
              success: `${roomNumber} status updated`,

              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              error: (err: any) => {
                console.log(err);
                return err.message || `${roomNumber} status update failed`;
              },
            }
          );
          setLoading(false);
        }}
      />
      <Label
        htmlFor="currentStatus"
        className={`${loading ? "pointer-events-none" : ""} capitalize align-middle mb-0 `}
      >
        {loading ? "Updating..." : currentStatus}
      </Label>
    </div>
  );
}
