"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link2, Loader2, MoreHorizontal, Share2, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { deletePoll } from "~/actions/common.poll";
import { pollHref } from "./utils";

const itemClass = "min-h-10 gap-2.5 px-2.5 text-body [&_svg]:size-4";

/** Share, copy link and (for the author or an admin) delete, kept behind one trigger. */
export function PollMenu({
  pollId,
  question,
  canManage,
  className,
}: {
  pollId: string;
  question: string;
  canManage: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, startDelete] = useTransition();

  const pollUrl = () =>
    new URL(pollHref(pollId), window.location.origin).toString();

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pollUrl());
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  async function share() {
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({ title: question, url: pollUrl() });
    } catch {
      // Closing the share sheet rejects; nothing to report.
    }
  }

  function confirmDelete() {
    startDelete(async () => {
      const result = await deletePoll(pollId).catch(() => null);
      if (!result?.ok) {
        toast.error(result?.error ?? "Couldn't delete the poll. Try again.");
        return;
      }
      toast.success("Poll deleted");
      setConfirmOpen(false);
      if (pathname.replace(/\/$/, "") === pollHref(pollId)) {
        router.replace("/polls");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            rounded="full"
            aria-label="More poll actions"
            className={cn("relative z-10 text-muted-foreground", className)}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-44 rounded-xl border-border bg-card p-1 dark:bg-background"
        >
          <DropdownMenuItem className={itemClass} onSelect={() => share()}>
            <Share2 aria-hidden="true" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem className={itemClass} onSelect={() => copyLink()}>
            <Link2 aria-hidden="true" />
            Copy link
          </DropdownMenuItem>
          {canManage && (
            <>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className={cn(
                  itemClass,
                  "text-destructive focus:text-destructive"
                )}
                onSelect={() => setConfirmOpen(true)}
              >
                <Trash2 aria-hidden="true" />
                Delete poll
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canManage && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this poll?</AlertDialogTitle>
              <AlertDialogDescription>
                "{question}" and all its votes are removed for everyone. This
                can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                Keep poll
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                {deleting ? "Deleting..." : "Delete poll"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
