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
import {
  Link2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { deletePost } from "~/actions/common.community";
import { callAction } from "~/lib/call-action";

type PostMenuProps = {
  postId: string;
  title: string;
  canManage: boolean;
  className?: string;
};

const itemClass = "min-h-10 gap-2.5 px-2.5 text-body [&_svg]:size-4";

/** Secondary post actions (share, copy, edit, delete) kept out of the card to hold visible choices to three. */
export function PostMenu({
  postId,
  title,
  canManage,
  className,
}: PostMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, startDelete] = useTransition();

  const postUrl = () =>
    new URL(`/community/posts/${postId}`, window.location.origin).toString();

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl());
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  async function share() {
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({ title, url: postUrl() });
    } catch {
      // Closing the share sheet rejects; nothing to report.
    }
  }

  function confirmDelete() {
    startDelete(async () => {
      const res = await callAction(() => deletePost(postId));
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Post deleted");
      setConfirmOpen(false);
      if (pathname.startsWith("/community/posts/")) {
        router.replace("/community");
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
            aria-label="More post actions"
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
              <DropdownMenuItem className={itemClass} asChild>
                <Link href={`/community/edit?postId=${postId}`}>
                  <Pencil aria-hidden="true" />
                  Edit post
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  itemClass,
                  "text-destructive focus:text-destructive"
                )}
                onSelect={() => setConfirmOpen(true)}
              >
                <Trash2 aria-hidden="true" />
                Delete post
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canManage && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
              <AlertDialogDescription>
                "{title}" and its comments are removed for everyone. This can't
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                Keep post
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                {deleting ? "Deleting..." : "Delete post"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
