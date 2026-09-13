"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function FlushCacheButton({
  flushFn,
}: {
  flushFn: () => Promise<boolean>;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      icon={isPending ? "loader-circle" : "broom"}
      iconClassName={isPending ? "animate-spin" : ""}
      onClick={() => {
        startTransition(async () => {
          const id = toast.loading("Flushing cache...");
          try {
            // flushFn resolves false on failure instead of throwing.
            if (await flushFn()) toast.success("Cache flushed", { id });
            else toast.error("Could not flush the cache", { id });
          } catch {
            toast.error("Could not flush the cache", { id });
          }
        });
      }}
    >
      {isPending ? "Flushing..." : "Flush cache"}
    </Button>
  );
}
