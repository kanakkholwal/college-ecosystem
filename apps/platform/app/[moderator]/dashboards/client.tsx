"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function FlushCacheButton({ flushFn }: {
  flushFn: () => Promise<boolean>;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button size="sm" variant="default_soft" className="gap-2"
      disabled={isPending}
      icon={isPending ? "loader-circle" : "broom"}
      iconClassName={isPending ? "animate-spin" : ""}
      onClick={() => {
        startTransition(() => {
          toast.promise(
            flushFn(),
            {
              loading: "Flushing cache...",
              success: "Cache flushed successfully!",
              error: "Failed to flush cache.",
            }
          );
        });
      }}>
      {isPending ? "Flushing..." : "Flush Cache"}
    </Button>
  );
}