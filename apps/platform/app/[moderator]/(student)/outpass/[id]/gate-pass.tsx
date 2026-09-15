"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import toast from "@/lib/toast";

const Barcode = dynamic(() => import("barcode-react"), {
  ssr: false,
  loading: () => <Skeleton className="h-24 w-full rounded-lg bg-muted" />,
});

/** Scannable strip plus a PNG download of the pass above it. */
export function GatePassCode({
  value,
  fileName,
  targetId,
}: {
  value: string;
  fileName: string;
  targetId: string;
}) {
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  const download = async () => {
    const node = document.getElementById(targetId);
    if (!node || busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(node, {
        pixelRatio: 3,
        backgroundColor: getComputedStyle(node).backgroundColor,
        filter: (el) => !(el instanceof HTMLButtonElement),
      });
      const link = document.createElement("a");
      link.download = fileName;
      link.href = url;
      link.click();
    } catch {
      toast.error("Couldn't save the image. Take a screenshot instead.");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Scanners need pure black on white in both themes. */}
      <div className="rounded-xl border border-border bg-fixed-light p-3">
        <Barcode
          value={value}
          height={80}
          displayValue={false}
          background="white"
          lineColor="black"
          className="h-auto w-full"
        />
      </div>
      <p className="text-center font-mono text-caption text-muted-foreground">
        {value}
      </p>
      <Button variant="outline" size="lg" onClick={download} disabled={saving}>
        <Download aria-hidden="true" />
        {saving ? "Saving image" : "Save pass as image"}
      </Button>
    </div>
  );
}
