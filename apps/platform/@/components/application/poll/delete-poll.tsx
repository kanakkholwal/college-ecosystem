"use client";

import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { cn } from "@/lib/utils";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import type { PollType } from "src/models/poll";
import { deletePoll } from "~/actions/common.poll";

export default function DeletePoll({
  pollId,
  className,
  redirectTo,
}: {
  pollId: PollType["_id"];
  className?: string;
  /** Where to go once deleted; set it when the page shows only this poll. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await toast.promise(deletePoll(pollId), {
        loading: "Deleting poll...",
        success: "Poll deleted",
        error: "Couldn't delete the poll",
      });
      if (redirectTo) router.replace(redirectTo);
      else router.refresh();
    } catch {
      // toast.promise already surfaced the error
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ResponsiveDialog
      title="Delete this poll?"
      description="Its votes are removed for everyone. This can't be undone."
      btnProps={{
        variant: "ghost",
        size: "icon_sm",
        "aria-label": "Delete poll",
        className: cn(
          "text-muted-foreground hover:text-destructive",
          className
        ),
        children: <Trash2 />,
      }}
    >
      <Button
        variant="destructive"
        width="full"
        disabled={deleting}
        onClick={handleDelete}
      >
        {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        {deleting ? "Deleting..." : "Delete poll"}
      </Button>
    </ResponsiveDialog>
  );
}
