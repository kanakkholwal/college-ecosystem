"use client";

import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { cn } from "@/lib/utils";
import { useState } from "react";
import toast from "react-hot-toast";
import type { PollType } from "src/models/poll";
import { deletePoll } from "~/actions/common.poll";



export default function DeletePoll({ pollId, className }: { pollId: PollType["_id"], className?: string }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    toast.promise(deletePoll(pollId), {
      loading: "Deleting poll...",
      success: "Poll deleted successfully",
      error: "Failed to delete poll",
    })
      .finally(() => setDeleting(false));
  };

  return (
    <ResponsiveDialog
      title="Delete Poll"
      description="Are you sure you want to delete this poll?"
      btnProps={{
        variant: "destructive_soft",
        icon: "trash",
        size: "icon_sm",
        className: cn("absolute right-4 top-4", className),
      }}
    >
      <Button
        variant="destructive"
        width="full"
        disabled={deleting}
        onClick={handleDelete}
        icon={deleting ? "loader-circle" : "trash"}
        iconClassName={cn(deleting ? "animate-spin" : "")}
      >
        {deleting ? "Deleting..." : "Delete Poll"}
      </Button>
    </ResponsiveDialog>
  );
}
