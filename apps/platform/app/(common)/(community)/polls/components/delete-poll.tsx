"use client";

import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { createClient } from "@supabase/supabase-js";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { deletePoll } from "src/actions/common.poll"; // keep if you still need server-side cleanup
import type { PollType } from "src/models/poll";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DeletePoll({ pollId }: { pollId: PollType["_id"] }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    toast
      .promise(
        (async () => {
          // 1. Supabase delete
          const { error } = await supabase
            .from("polls")
            .delete()
            .eq("id", pollId.toString());

          if (error) {
            throw error;
          }

          // 2. (Optional) server-side cleanup if your app needs it
          try {
            await deletePoll(pollId);
          } catch (err) {
            console.warn("Server cleanup failed:", err);
          }

          return true;
        })(),
        {
          loading: "Deleting poll...",
          success: "Poll deleted successfully",
          error: "Failed to delete poll",
        }
      )
      .finally(() => setLoading(false));
  };

  return (
    <ResponsiveDialog
      title="Delete Poll"
      description="Are you sure you want to delete this poll?"
      btnProps={{
        variant: "destructive_soft",
        children: <Trash2 />,
        size: "icon_sm",
        className: "absolute right-4 top-4",
      }}
    >
      <Button
        variant="destructive"
        width="full"
        disabled={loading}
        onClick={handleDelete}
      >
        {loading ? "Deleting..." : "Delete Poll"}
      </Button>
    </ResponsiveDialog>
  );
}
