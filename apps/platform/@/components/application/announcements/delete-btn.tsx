"use client";

import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteAnnouncement } from "~/actions/common.announcement";

export default function DeleteButton({
  announcementId,
}: {
  announcementId: string;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await toast.promise(deleteAnnouncement(announcementId), {
        loading: "Deleting announcement...",
        success: "Announcement deleted",
        error: (err) =>
          typeof err === "string" ? err : "Couldn't delete the announcement",
      });
    } catch {
      // toast.promise already surfaced the error
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ResponsiveDialog
      title="Delete this announcement?"
      description="It's removed for everyone. This can't be undone."
      btnProps={{
        variant: "ghost",
        size: "icon_sm",
        "aria-label": "Delete announcement",
        className: "shrink-0 text-muted-foreground hover:text-destructive",
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
        {deleting ? "Deleting..." : "Delete announcement"}
      </Button>
    </ResponsiveDialog>
  );
}
