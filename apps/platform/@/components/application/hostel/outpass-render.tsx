"use client";

import BarCode from "barcode-react";
import { format } from "date-fns";
import { toPng } from "html-to-image";
import { ArrowRight, Download, LoaderCircle, ScanBarcode } from "lucide-react";
import { useRef, useState } from "react";
import toast from "@/lib/toast";
import {
  OutpassStatusTag,
  REASON_LABEL,
  shortDateTime,
} from "@/components/application/hostel/ui";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/utils/link";
import type { OutPassType } from "~/models/hostel_n_outpass";
import { orgConfig } from "~/project.config";

interface OutpassRenderProps {
  outpass: OutPassType;
  viewOnly?: boolean;
  requestNewPath?: string;
}

const USABLE: OutPassType["status"][] = ["approved", "in_use", "processed"];

export default function OutpassRender({
  outpass,
  viewOnly = false,
  requestNewPath = "outpass/request",
}: OutpassRenderProps) {
  const passRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const usable = USABLE.includes(outpass.status);
  const reference = outpass._id.toString().slice(-6).toUpperCase();

  const handleDownload = async () => {
    const node = passRef.current;
    if (!node) return;
    setIsDownloading(true);
    try {
      const scale = 3;
      const dataUrl = await toPng(node, {
        cacheBust: true,
        width: node.offsetWidth * scale,
        height: node.offsetHeight * scale,
        backgroundColor: getComputedStyle(node).backgroundColor,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${node.offsetWidth}px`,
          height: `${node.offsetHeight}px`,
        },
      });
      const link = document.createElement("a");
      link.download = `Outpass_${outpass.student.rollNumber}_${format(new Date(), "yyyyMMdd")}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Outpass downloaded");
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Couldn't create the image");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      {!viewOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-body text-muted-foreground">
            Reference{" "}
            <span className="font-mono text-foreground">#{reference}</span>
          </p>
          <div className="flex gap-2">
            <ButtonLink variant="ghost" href={requestNewPath}>
              New request <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={isDownloading || !usable}
            >
              {isDownloading ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Download aria-hidden="true" />
              )}
              Download
            </Button>
          </div>
        </div>
      )}

      <div
        ref={passRef}
        className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card dark:bg-background"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-caption font-medium text-muted-foreground">
              {orgConfig.name}, hostel outpass
            </p>
            <h2 className="truncate text-heading-sm font-medium text-foreground">
              {outpass.student.name}
            </h2>
            <p className="font-mono text-body text-muted-foreground">
              {outpass.student.rollNumber}
            </p>
          </div>
          <OutpassStatusTag status={outpass.status} />
        </div>

        <dl className="grid grid-cols-2 gap-4 p-5 text-body">
          <Fact
            label="Reason"
            value={REASON_LABEL[outpass.reason] ?? outpass.reason}
          />
          <Fact
            label="Hostel and room"
            value={`${outpass.hostel.name}, ${outpass.roomNumber}`}
          />
          <Fact
            label="Leaving"
            value={shortDateTime(outpass.expectedOutTime)}
          />
          <Fact label="Back by" value={shortDateTime(outpass.expectedInTime)} />
          <div className="col-span-2">
            <Fact label="Going to" value={outpass.address} wrap />
          </div>
          {outpass.status === "rejected" && outpass.rejectionReason && (
            <div className="col-span-2">
              <Fact
                label="Warden's reason"
                value={outpass.rejectionReason}
                wrap
              />
            </div>
          )}
        </dl>

        <div className="border-t border-dashed border-border-strong p-5">
          {usable ? (
            <div className="flex flex-col items-center gap-2">
              {/* Scanners need dark bars on a light quiet zone in either theme. */}
              <div className="w-full rounded-xl bg-white p-3 text-black">
                <BarCode
                  value={outpass._id.toString()}
                  height={64}
                  fontSize={0}
                  background="transparent"
                  lineColor="currentColor"
                  className="h-auto w-full"
                />
              </div>
              <p className="font-mono text-caption text-muted-foreground">
                Show this at the gate. #{reference}
              </p>
            </div>
          ) : (
            <p className="flex items-center justify-center gap-2 py-6 text-body text-muted-foreground">
              <ScanBarcode className="size-5" aria-hidden="true" />
              {outpass.status === "rejected"
                ? "No barcode: this request was rejected"
                : "The barcode appears once the warden approves"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  wrap,
}: {
  label: string;
  value: string;
  wrap?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd
        className={
          wrap
            ? "font-medium text-foreground"
            : "truncate font-medium text-foreground"
        }
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
