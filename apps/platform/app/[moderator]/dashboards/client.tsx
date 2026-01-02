"use client";

import { Button } from "@/components/ui/button";
import { PiBroomDuotone } from "react-icons/pi";
import { toast } from "sonner";
import { flushAllRedisKeys } from "~/lib/redis";

export function FlushCacheButton({flushFn}:{
    flushFn: () => Promise<boolean>;
}) {
  return (
    <Button size="sm" className="gap-2" onClick={() =>{``
        toast.promise(
          flushFn(),
          {
            loading: "Flushing cache...",
            success: "Cache flushed successfully!",
            error: "Failed to flush cache.",
          }
        );
    }}>
      <PiBroomDuotone className="size-4" /> Flush Cache
    </Button>
  );
}