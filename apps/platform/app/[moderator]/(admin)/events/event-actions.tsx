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
import { Eye, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { deleteEvent } from "~/actions/common.events";
import { callAction } from "~/lib/call-action";

type Target = { id: string; title: string };

function DeleteEventDialog({
  event,
  open,
  onOpenChange,
  redirectTo,
}: {
  event: Target;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const res = await callAction(() => deleteEvent(event.id));
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Deleted "${event.title}"`);
      onOpenChange(false);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !pending && onOpenChange(next)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this event?</AlertDialogTitle>
          <AlertDialogDescription>
            "{event.title}" will be removed from the public academic calendar.
            This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep event</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 aria-hidden="true" />
            )}
            {pending ? "Deleting" : "Delete event"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function EventRowMenu({ event }: { event: Target }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      {/* Non-modal so focus and pointer events come back before the dialog opens. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon_sm"
            aria-label={`Actions for ${event.title}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem asChild>
            <Link href={`/admin/events/${event.id}`}>
              <Eye className="mr-2 size-4" aria-hidden="true" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/events/${event.id}/edit`}>
              <Pencil className="mr-2 size-4" aria-hidden="true" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setConfirming(true)}
          >
            <Trash2 className="mr-2 size-4" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteEventDialog
        event={event}
        open={confirming}
        onOpenChange={setConfirming}
      />
    </>
  );
}

export function DeleteEventButton({ event }: { event: Target }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setConfirming(true)}>
        <Trash2 aria-hidden="true" />
        Delete
      </Button>
      <DeleteEventDialog
        event={event}
        open={confirming}
        onOpenChange={setConfirming}
        redirectTo="/admin/events"
      />
    </>
  );
}
