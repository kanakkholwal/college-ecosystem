"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteAnnouncement } from "~/actions/common.announcement";

export default function DeleteButton({
  announcementId,
}: {
  announcementId: string;
}) {
  return (
    <Button
      size="icon_sm"
      variant="destructive_soft"
      onClick={() => {
        if (confirm("Are you sure you want to delete this announcement?")) {
          toast.promise(deleteAnnouncement(announcementId), {
            loading: "Deleting Announcement",
            success: (data) => {
              console.log(data);
              return "Announcement Deleted";
            },
            error: (err) => {
              console.error(err);
              return "Failed to delete announcement";
            },
          });
        }
      }}
    >
      <Trash2 />
    </Button>
  );
}
