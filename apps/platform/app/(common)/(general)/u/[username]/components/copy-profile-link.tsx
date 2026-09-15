"use client";

import { Button } from "@/components/ui/button";
import { Check, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "@/lib/toast";

export function CopyProfileLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        new URL(path, window.location.origin).toString()
      );
      setCopied(true);
      toast.success("Profile link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={copy}>
      {copied ? <Check /> : <Link2 />}
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}
