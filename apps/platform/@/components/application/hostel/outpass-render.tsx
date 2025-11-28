"use client";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import BarCode from "barcode-react";
import { format } from "date-fns";
import { toPng } from "html-to-image";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  Download,
  FileCheck,
  History,
  Loader2,
  LogOut,
  MapPin,
  PenTool,
  ShieldCheck,
  XCircle
} from "lucide-react";
import { Dancing_Script } from "next/font/google";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import type { OutPassType } from "~/models/hostel_n_outpass";
import { orgConfig } from "~/project.config";

// Load Signature Font
const signatureFont = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface OutpassRenderProps {
  outpass: OutPassType;
  viewOnly?: boolean;
  requestNewPath?: string;
}

export default function OutpassRender({
  outpass,
  viewOnly = false,
  requestNewPath = "outpass/request",
}: OutpassRenderProps) {
  const outpassRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Status Styling Logic - REFACTORED FOR ALL STATES
  const getStatusTheme = (status: string) => {
    switch (status) {
      case "approved":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          text: "text-emerald-700",
          icon: <CheckCircle2 className="h-5 w-5" />,
          label: "AUTHORIZED",
          watermarkColor: "bg-emerald-100"
        };
      case "in_use":
        return {
          bg: "bg-blue-50",
          border: "border-blue-100",
          text: "text-blue-700",
          icon: <LogOut className="h-5 w-5" />,
          label: "OUTSIDE CAMPUS",
          watermarkColor: "bg-blue-100"
        };
      case "processed":
        return {
          bg: "bg-slate-100",
          border: "border-slate-200",
          text: "text-slate-600",
          icon: <CheckCheck className="h-5 w-5" />,
          label: "COMPLETED",
          watermarkColor: "bg-slate-200"
        };
      case "rejected":
        return {
          bg: "bg-rose-50",
          border: "border-rose-100",
          text: "text-rose-700",
          icon: <XCircle className="h-5 w-5" />,
          label: "REJECTED",
          watermarkColor: "bg-rose-100"
        };
      case "pending":
      default:
        return {
          bg: "bg-amber-50",
          border: "border-amber-100",
          text: "text-amber-700",
          icon: <History className="h-5 w-5" />,
          label: "PENDING",
          watermarkColor: "bg-amber-100"
        };
    }
  };

  const statusTheme = getStatusTheme(outpass.status);

  const handleDownload = async () => {
    if (outpassRef.current) {
      try {
        setIsDownloading(true);
        // Delay to ensure fonts/layout settle
        await new Promise((resolve) => setTimeout(resolve, 500));

        const node = outpassRef.current;
        const scale = 3; // 3x scale for high-quality printing

        const dataUrl = await toPng(node, {
          cacheBust: true,
          width: node.offsetWidth * scale,
          height: node.offsetHeight * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${node.offsetWidth}px`,
            height: `${node.offsetHeight}px`,
             // Ensure background colors are captured correctly in the image
            backgroundColor: statusTheme.bg.replace("bg-", ""),
          },
        });

        const link = document.createElement("a");
        link.download = `Outpass_${outpass.student.rollNumber}_${format(new Date(), "yyyyMMdd")}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Outpass downloaded successfully");
      } catch (error) {
        console.error("Download failed", error);
        toast.error("Failed to generate outpass image");
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const isSigned = ["approved", "in_use", "processed"].includes(outpass.status);

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-3xl mx-auto">
      
      {/* --- Control Bar --- */}
      {!viewOnly && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold leading-none">Digital Outpass</h3>
              <p className="text-sm text-muted-foreground">
                Reference: #{outpass._id.toString().slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ButtonLink variant="ghost" size="sm" href={requestNewPath}>
              New Request <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <Button
              onClick={handleDownload}
              disabled={isDownloading || outpass.status === "pending" || outpass.status === "rejected"}
              size="sm"
              className="min-w-[140px]"
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isDownloading ? "Processing..." : "Download Pass"}
            </Button>
          </div>
        </div>
      )}

      {/* --- The Render Wrapper --- */}
      <div className="w-full overflow-x-auto pb-8 pt-4 px-2 flex justify-center bg-muted/30 rounded-2xl border border-dashed backdrop-blur-lg">
        
        {/* --- THE VERTICAL PASS (Print Target) --- */}
        <div
          ref={outpassRef}
          className="relative flex flex-col w-[450px] shrink-0 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5"
          style={{ fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif' }}
        >
          {/* --- TOP SECTION: Main Info --- */}
          <div className="p-6 bg-white relative">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5 mb-6">
              <div className="flex items-center gap-3">
            
                <div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                    {orgConfig.name}
                  </h1>
                  <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
                    Hostel Administration
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Label>Pass Type</Label>
                <div className="font-bold text-slate-900">Outpass</div>
              </div>
            </div>

            {/* Student Info Stack */}
            <div className="flex flex-col gap-6 mb-8">
                {/* Name & Roll */}
                <div>
                    <Label>Student Name</Label>
                    <div className="text-2xl font-bold text-slate-900 leading-tight">
                        {outpass.student.name}
                    </div>
                    <div className="text-sm text-slate-500 font-medium mt-0.5">
                        {outpass.student.rollNumber}
                    </div>
                </div>

                {/* Trip Details Stack */}
                <div className="space-y-4 pl-1 border-l-2 border-slate-100">
                     <div className="space-y-1.5 pl-3">
                        <Label>Destination & Reason</Label>
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                            <span className="font-semibold text-slate-800 leading-snug">
                                {outpass.address}
                            </span>
                        </div>
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 ml-5">
                            {outpass.reason}
                        </span>
                    </div>
                </div>
            </div>

            {/* Timeline Section (Big Visuals) */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 grid grid-cols-2 gap-4 mb-6 relative overflow-hidden">
                 {/* Decorative line */}
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-px bg-slate-300/50 hidden sm:block"></div>

                 <div className="space-y-1">
                    <Label>Departure</Label>
                    <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-slate-400" />
                        <span className="font-mono text-base font-bold text-slate-800">
                            {format(new Date(outpass.expectedOutTime), "dd MMM HH:mm")}
                        </span>
                    </div>
                 </div>

                 <div className="space-y-1 pl-2">
                    <Label>Return By</Label>
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-slate-400" />
                        <span className="font-mono text-base font-bold text-slate-800">
                             {format(new Date(outpass.expectedInTime), "dd MMM HH:mm")}
                        </span>
                    </div>
                 </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                    <div className="h-10 border-b-2 border-slate-200 relative">
                        <span className={cn(signatureFont.className, "absolute bottom-1 left-0 text-xl text-slate-700")}>
                             {outpass.student.name.split(' ')[0]}
                        </span>
                    </div>
                    <p className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <PenTool className="h-3 w-3" /> Student Signature
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="h-10 border-b-2 border-slate-200 relative">
                        {isSigned ? (
                            <div className="absolute bottom-0 left-0 flex items-end">
                                <span className={cn(signatureFont.className, "text-2xl text-slate-900")}>Authorized</span>
                                <ShieldCheck className={cn("h-4 w-4 mb-2 ml-1", statusTheme.text)} />
                            </div>
                        ) : (
                            <span className="absolute bottom-1 text-xs text-slate-400 italic">Pending Approval</span>
                        )}
                    </div>
                    <p className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> Authority Signature
                    </p>
                </div>
            </div>

          </div>

          {/* --- HORIZONTAL CUTOUT DIVIDER --- */}
          <div className="relative h-px w-full border-t-2 border-dashed border-slate-200/60 z-10">
            {/* Left Cutout */}
            <div className={cn("absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full box-content border-[10px] border-transparent", statusTheme.bg)} style={{ boxShadow: `inset -5px 0 5px -5px rgba(0,0,0,0.1)` }}></div>
             {/* Right Cutout */}
            <div className={cn("absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full box-content border-[10px] border-transparent", statusTheme.bg)} style={{ boxShadow: `inset 5px 0 5px -5px rgba(0,0,0,0.1)` }}></div>
          </div>

          {/* --- BOTTOM SECTION: Verification Stub --- */}
          <div className={cn("p-6 flex flex-col items-center text-center relative transition-colors duration-300", statusTheme.bg)}>
             
             {/* Status Badge */}
             <div className={cn("w-full py-3 rounded-xl border flex flex-col items-center gap-1 mb-6 shadow-sm bg-white/80 backdrop-blur-sm", statusTheme.border)}>
                <span className={cn(statusTheme.text)}>{statusTheme.icon}</span>
                <span className={cn("text-sm font-black tracking-[0.2em]", statusTheme.text)}>
                    {statusTheme.label}
                </span>
             </div>

             {/* Barcode Area - Only visible if approved/active/processed */}
             {outpass.status !== "rejected" && outpass.status !== "pending" ? (
                 <>
                    <div className="w-full p-4 bg-white rounded-xl shadow-sm border border-slate-100/50 mb-6">
                            <BarCode 
                                value={outpass._id.toString()}
                                height={70}
                                fontSize={0} // Hide default text
                                background="#ffffff"
                                lineColor="#000000"
                                className="w-full h-auto"
                            />
                    </div>
                    <div className="space-y-1 mb-6">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Scan to Verify</p>
                            <p className="font-mono text-xs text-slate-400 tracking-widest">{outpass._id.toString().slice(-12)}</p>
                    </div>
                 </>
             ) : (
                 // Placeholder for when barcode is not generated yet
                 <div className="w-full h-32 mb-6 rounded-xl border-2 border-dashed border-slate-300/50 flex flex-col items-center justify-center text-slate-400 gap-2">
                     <FileCheck className="h-8 w-8 opacity-50" />
                     <span className="text-[10px] font-bold uppercase tracking-wider">Barcode Not Generated</span>
                 </div>
             )}

             {/* Footer Info */}
             <div className="w-full border-t border-slate-900/10 pt-4 grid grid-cols-2 gap-4">
                 <div className="text-left">
                    <Label className={cn("text-slate-500", statusTheme.text)}>HOSTEL</Label>
                    <div className="text-slate-900 font-bold text-sm uppercase truncate">{outpass.hostel.name}</div>
                 </div>
                 <div className="text-right">
                    <Label className={cn("text-slate-500", statusTheme.text)}>ROOM NO</Label>
                    <div className="text-slate-900 font-bold text-sm">{outpass.roomNumber}</div>
                 </div>
             </div>

          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground max-w-md leading-relaxed">
        This digital pass is official property of {orgConfig.name}. Misuse is punishable. The barcode contains encrypted biometric verification data.
      </p>
    </div>
  );
}

// Reusable Label Component
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5", className)}>
      {children}
    </div>
  );
}