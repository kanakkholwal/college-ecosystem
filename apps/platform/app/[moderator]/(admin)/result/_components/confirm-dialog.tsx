"use client";

import { TriangleAlert } from "lucide-react";
import { useId, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  /** What will happen, one plain sentence each. */
  consequences: string[];
  confirmLabel: string;
  tone?: "destructive" | "primary";
  /** Typed confirmation for irreversible work, e.g. the roll number being deleted. */
  requireText?: string;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  consequences,
  confirmLabel,
  tone = "primary",
  requireText,
  onConfirm,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const inputId = useId();
  const matches =
    !requireText || typed.trim().toLowerCase() === requireText.toLowerCase();

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped("");
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className="rounded-2xl border-border bg-card dark:bg-background">
        <AlertDialogHeader className="gap-2 space-y-0 text-left">
          <AlertDialogTitle className="text-body-lg font-medium text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="flex flex-col gap-2 rounded-xl border border-border p-4 text-body text-foreground">
          {consequences.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <TriangleAlert
                className={
                  tone === "destructive"
                    ? "mt-0.5 size-4 shrink-0 text-destructive"
                    : "mt-0.5 size-4 shrink-0 text-warning"
                }
                aria-hidden="true"
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {requireText && (
          <div className="flex flex-col gap-2">
            <Label htmlFor={inputId} className="text-body text-foreground">
              Type <span className="font-mono font-medium">{requireText}</span>{" "}
              to confirm
            </Label>
            <Input
              id={inputId}
              value={typed}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches) {
                  onConfirm();
                  onOpenChange(false);
                  setTyped("");
                }
              }}
            />
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:space-x-0">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <Button
            variant={tone === "destructive" ? "destructive" : "primary"}
            disabled={!matches}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
              setTyped("");
            }}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
