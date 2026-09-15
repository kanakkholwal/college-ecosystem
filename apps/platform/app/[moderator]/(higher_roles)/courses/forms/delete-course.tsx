"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import toast from "@/lib/toast";
import { removeCourse } from "../actions";

export function DeleteCourse({
  courseId,
  code,
  moderator,
}: {
  courseId: string;
  code: string;
  moderator: string;
}) {
  const router = useRouter();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [isPending, startTransition] = useTransition();
  const confirmed = typed.trim() === code;

  const onDelete = () =>
    startTransition(async () => {
      const result = await removeCourse(courseId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${code} deleted`);
      setOpen(false);
      router.push(`/${moderator}/courses`);
    });

  return (
    <section
      aria-labelledby="delete-course-title"
      className="flex flex-col gap-4 rounded-2xl border border-destructive/40 bg-card p-5 sm:flex-row sm:items-center sm:justify-between md:p-6 dark:bg-background"
    >
      <div className="min-w-0 space-y-1">
        <h2
          id="delete-course-title"
          className="text-body-lg font-medium text-foreground"
        >
          Delete this course
        </h2>
        <p className="text-body text-muted-foreground">
          Removes the course, its units, references and papers from the public
          syllabus. This can't be undone.
        </p>
      </div>
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (isPending) return;
          setOpen(next);
          if (!next) setTyped("");
        }}
      >
        <AlertDialogTrigger asChild>
          <Button variant="destructive_soft" className="shrink-0">
            <Trash2 />
            Delete course
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-subheading font-medium">
              Delete {code}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body">
              Students lose the syllabus, references and papers for this course.
              Type the course code to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor={inputId} className="mb-0 text-body text-foreground">
              Course code
            </Label>
            <Input
              id={inputId}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={code}
              autoComplete="off"
              className="font-mono"
            />
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isPending}>
              Keep course
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!confirmed || isPending}
              onClick={onDelete}
            >
              {isPending && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              Delete permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
