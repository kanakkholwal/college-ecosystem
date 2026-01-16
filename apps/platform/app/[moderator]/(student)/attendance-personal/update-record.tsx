"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Trash2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  updateAttendanceRecord: (present: boolean) => Promise<string>;
  deleteAttendanceRecord: () => Promise<string>;
  children?: React.ReactNode;
  className?: string;
  deleteFloating?: boolean;
}

export function UpdateAttendanceRecord({
  updateAttendanceRecord,
  deleteAttendanceRecord,
  children,
  className,
  deleteFloating = true,
}: Props) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (present: boolean) => {
    setUpdating(true);
    try {
      toast.promise(updateAttendanceRecord(present), {
        loading: `Updating ${present ? "Present" : "Absent"} Record`,
        success: `${present ? "Present" : "Absent"} Updated Successfully`,
        error: "Failed to update Attendance Record",
      });
    } catch (error) {
      console.error(error);
    }
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    setDeleting(true);
    try {
      toast.promise(deleteAttendanceRecord(), {
        loading: "Deleting Record",
        success: "Record Deleted Successfully",
        error: "Failed to delete Record",
      });
    } catch (error) {
      console.error(error);
    }
    setDeleting(false);
  };

  return (
    <div className={cn("flex gap-2 items-center justify-start mt-4", className)}>
      <Button
        variant="success_soft"
        disabled={updating}
        size="sm"
        onClick={() => handleUpdate(true)}
        className="overflow-hidden [&:hover_.check-icon]:scale-110 [&:hover_.check-text]:max-w-xs [&:hover_.check-text]:opacity-100 [&:hover_.check-text]:ml-2"
      >
        <Check className="check-icon transition-transform duration-200" />
        <span className="check-text inline-block max-w-0 opacity-0 transition-all duration-300 ease-out whitespace-nowrap overflow-hidden">
          Mark as Present
        </span>
      </Button>
      <Button
        variant="destructive_soft"
        size="sm"
        disabled={updating}
        onClick={() => handleUpdate(false)}
        className="overflow-hidden [&:hover_.check-icon]:scale-110 [&:hover_.check-text]:max-w-xs [&:hover_.check-text]:opacity-100 [&:hover_.check-text]:ml-2"
      >
        <X className="x-icon transition-transform duration-200" />
        <span className="check-text inline-block max-w-0 opacity-0 transition-all duration-300 ease-out whitespace-nowrap overflow-hidden">
          Mark as Absent
        </span>
      </Button>
      <Button
        variant="destructive_soft"
        size="icon_sm"
        disabled={updating}
        onClick={() => handleDelete()}
        className={cn(
          deleteFloating && "absolute right-2 top-2 left-auto bg-transparent",
        )}
      >
        <Trash2 />
      </Button>
      {children}
    </div>
  );
}
