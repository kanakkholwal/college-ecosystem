"use client";

import toast from "@/lib/toast";

export function undoToast(message: string, onUndo: () => void) {
  toast(
    (t) => (
      <span className="flex items-center gap-3 text-body">
        <span className="text-foreground">{message}</span>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(t.id);
            onUndo();
          }}
          className="inline-flex h-10 shrink-0 items-center rounded-md px-3 font-medium text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          Undo
        </button>
      </span>
    ),
    { duration: 6000 }
  );
}
