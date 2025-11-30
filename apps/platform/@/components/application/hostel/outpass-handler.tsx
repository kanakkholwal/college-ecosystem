"use client";

import { useExternalBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { format } from "date-fns";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { allowEntryExit } from "~/actions/hostel.outpass";
import { apiFetch } from "~/lib/fetch-client";
import type { OutPassType } from "~/models/hostel_n_outpass";

// Icons
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  LogIn,
  LogOut,
  ScanBarcode,
  Search,
  ShieldCheck,
  Terminal,
  X, // Added X icon
  XCircle
} from "lucide-react";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ConditionalRender from "@/components/utils/conditional-render";
import { ErrorBoundary } from "@/components/utils/error-boundary";
import { cn } from "@/lib/utils";
import OutpassList from "./outpass-list";
import OutpassRender from "./outpass-render";

// --- Types ---
type ResponseType =
  | { identifier: "rollNo"; history: OutPassType[] }
  | { identifier: "id"; outpass: OutPassType | null }
  | { identifier: "unknown"; message: string; error?: string | unknown };

// --- Helpers ---
async function fetchByIdentifier(identifier: string) {
  return await apiFetch<ResponseType>(`/api/outpass/status?identifier=${identifier}`);
}

function getActionState(outpass: OutPassType) {
  const now = new Date().getTime();
  const validTill = new Date(outpass.expectedInTime).getTime();
  const isExpired = validTill < now;

  // 1. Rejected or Pending
  if (outpass.status === 'rejected' || outpass.status === 'pending') {
    return {
      type: 'denied',
      label: 'Pass Not Approved',
      color: 'destructive',
      icon: <XCircle className="h-6 w-6" />
    };
  }

  // 2. Already Completed (In and Out)
  if (outpass.actualOutTime && outpass.actualInTime) {
    return {
      type: 'completed',
      label: 'Outing Completed',
      color: 'secondary',
      icon: <CheckCircle2 className="h-6 w-6" />
    };
  }

  // 3. Trying to Exit (Hasn't gone out yet)
  if (!outpass.actualOutTime) {
    if (isExpired) return {
      type: 'expired',
      label: 'Pass Expired',
      color: 'destructive',
      icon: <Clock className="h-6 w-6" />
    };

    return {
      type: 'exit',
      label: 'Authorized to Exit',
      color: 'success',
      icon: <LogOut className="h-6 w-6" />
    };
  }

  // 4. Trying to Enter (Has gone out, hasn't come back)
  if (outpass.actualOutTime && !outpass.actualInTime) {
    return {
      type: 'entry',
      label: 'Returning to Campus',
      color: 'info',
      icon: <LogIn className="h-6 w-6" />
    };
  }

  return { type: 'unknown', label: 'Unknown State', color: 'muted', icon: <AlertCircle /> };
}

// --- Skeleton Component for Loading State ---
function OutpassSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
      {/* Left Col Skeleton */}
      <div className="lg:col-span-5 space-y-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-32 rounded-xl b" />
      </div>
      {/* Right Col Skeleton */}
      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-32 " />
          <Skeleton className="w-full h-[500px] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export default function OutpassVerifier() {
  const { currentCode, clearHistory } = useExternalBarcodeScanner();
  const [rollNo, setRollNo] = useQueryState<string>("rollNo", parseAsString);
  const [outpassHistory, setOutpassHistory] = useState<OutPassType[]>([]);
  const [currentOutpass, setCurrentOutpass] = useState<OutPassType | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  // --- Handlers ---
  const handleClear = () => {
    setRollNo(null);
    setOutpassHistory([]);
    setCurrentOutpass(null);
    setError("");
    clearHistory();
  };

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;

    // Reset States before fetch
    setIsLoading(true);
    setError("");
    setOutpassHistory([]);
    setCurrentOutpass(null);
    clearHistory();

    try {
      // Simulate network delay if needed for UX, or just fetch
      const response = await fetchByIdentifier(term.trim());

      if (response.error || !response?.data) {
        setError(response.error?.message || "Student not found or system error.");
        return;
      }

      const data = response.data;
      if (data.identifier === "rollNo") {
        setOutpassHistory(data.history);
        setCurrentOutpass(data.history[0] || null);
      } else if (data.identifier === "id") {
        setCurrentOutpass(data.outpass);
        setOutpassHistory(data.outpass ? [data.outpass] : []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Network or server error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!currentOutpass) return;
    setIsUpdating(true);
    const actionType = currentOutpass.actualOutTime ? "entry" : "exit";

    try {
      await allowEntryExit(currentOutpass._id, actionType);
      toast.success(`Successfully logged ${actionType.toUpperCase()}`);
      const term = rollNo || currentCode;
      if (term) handleSearch(term);
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const actionState = currentOutpass ? getActionState(currentOutpass) : null;

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-foreground">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-border pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Terminal className="h-8 w-8 text-primary" />
              Security Console
            </h1>
            <p className="text-muted-foreground">Verify student movement and update logs.</p>
          </div>

          <div className="relative w-full md:w-[400px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <ScanBarcode className="h-4 w-4" />
            </div>
            <Input
              autoFocus
              className="pl-9 pr-[5.5rem] h-11 bg-card border-input focus-visible:ring-primary"
              placeholder="Scan Barcode / Enter Roll No"
              value={rollNo || ""}
              onChange={(e) => setRollNo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(e.currentTarget.value);
              }}
            />

            {/* Action Buttons inside Input */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* Clear Button */}
              {rollNo && (
                <Button
                  size="icon_sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={handleClear}
                  title="Clear Search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Search Button */}
              <Button
                size="icon_sm"
                variant="ghost"
                className="h-9 px-3"
                onClick={() => rollNo && handleSearch(rollNo)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* --- Error State --- */}
        <ConditionalRender condition={!!error}>
          <div className="bg-destructive/15 border border-destructive/50 text-destructive p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        </ConditionalRender>

        {/* --- Loading State --- */}
        <ConditionalRender condition={isLoading}>
          <OutpassSkeleton />
        </ConditionalRender>

        <ConditionalRender condition={!isLoading && !!currentOutpass}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in zoom-in-95 duration-300">

            {/* --- LEFT COL: Decision & Action (40%) --- */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">

              {/* 1. The Verdict Card */}
              <Card className={cn(
                "border-2 transition-colors duration-300",
                actionState?.color === 'success' && "bg-emerald-500/10 border-emerald-500/50 dark:bg-emerald-500/5",
                actionState?.color === 'info' && "bg-blue-500/10 border-blue-500/50 dark:bg-blue-500/5",
                actionState?.color === 'destructive' && "bg-red-500/10 border-red-500/50 dark:bg-red-500/5",
                actionState?.color === 'secondary' && "bg-muted/50 border-muted-foreground/20",
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-14 w-14 rounded-full flex items-center justify-center border shadow-sm",
                      "bg-background",
                      actionState?.color === 'success' && "text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
                      actionState?.color === 'info' && "text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800",
                      actionState?.color === 'destructive' && "text-red-600 border-red-200 dark:text-red-400 dark:border-red-800",
                      actionState?.color === 'secondary' && "text-muted-foreground border-border",
                    )}>
                      {actionState?.icon}
                    </div>
                    <div>
                      <CardDescription className="uppercase tracking-widest text-[10px] font-bold">Current Status</CardDescription>
                      <CardTitle className="text-2xl font-bold">{actionState?.label}</CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                  {/* Time Logs */}
                  <div className="grid grid-cols-2 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/50">
                    <div className="bg-card/50 p-3 space-y-1 text-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Out Time</span>
                      <div className="font-mono font-medium text-foreground">
                        {currentOutpass?.actualOutTime
                          ? format(new Date(currentOutpass.actualOutTime), "HH:mm, dd MMM")
                          : "-- : --"}
                      </div>
                    </div>
                    <div className="bg-card/50 p-3 space-y-1 text-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">In Time</span>
                      <div className="font-mono font-medium text-foreground">
                        {currentOutpass?.actualInTime
                          ? format(new Date(currentOutpass.actualInTime), "HH:mm, dd MMM")
                          : "-- : --"}
                      </div>
                    </div>
                  </div>

                  {/* BIG Action Button */}
                  <div className="pt-2">
                    {actionState?.type === 'exit' && (
                      <Button
                        size="lg"
                        className="w-full h-16 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        onClick={handleAction}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="animate-spin mr-2" /> : <LogOut className="mr-2 h-6 w-6" />}
                        APPROVE EXIT
                      </Button>
                    )}

                    {actionState?.type === 'entry' && (
                      <Button
                        size="lg"
                        className="w-full h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                        onClick={handleAction}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="mr-2 h-6 w-6" />}
                        APPROVE ENTRY
                      </Button>
                    )}

                    {(actionState?.type === 'denied' || actionState?.type === 'expired') && (
                      <Button size="lg" variant="destructive" className="w-full h-14" disabled>
                        <XCircle className="mr-2" /> ACTION BLOCKED
                      </Button>
                    )}

                    {actionState?.type === 'completed' && (
                      <Button size="lg" variant="secondary" className="w-full h-14" disabled>
                        <CheckCircle2 className="mr-2" /> PROCESSED
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Student Stats */}
              <Card>
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Verification Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Roll Number</span>
                    <span className="font-mono font-bold">{currentOutpass?.student.rollNumber}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Hostel Block</span>
                    <span className="font-semibold">{currentOutpass?.hostel.name}</span>
                  </div>
                  <div className="col-span-2 bg-muted/30 p-2 rounded border border-border/50">
                    <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Reason</span>
                    <span className="font-medium">{currentOutpass?.reason}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- RIGHT COL: Digital Pass & History (60%) --- */}
            <div className="lg:col-span-7 space-y-8">

              {/* The Digital Pass Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Live Ticket Preview</h3>
                  <Badge variant="outline" className="text-[10px]">READ ONLY</Badge>
                </div>
                <ErrorBoundary fallback={<div className="p-4 border border-destructive text-destructive rounded">Error rendering ticket</div>}>
                  {/* Ticket Wrapper */}
                  <div className="w-full flex justify-center bg-zinc-100/50 dark:bg-zinc-900/50 p-6 rounded-xl border border-dashed border-border overflow-hidden">
                    <div className="scale-[0.8] sm:scale-90 xl:scale-100 origin-center transition-transform">
                      <OutpassRender outpass={currentOutpass!} viewOnly={true} />
                    </div>
                  </div>
                </ErrorBoundary>
              </div>

              {/* History List */}
              {outpassHistory.length > 1 && (
                <div className="pt-8 border-t border-border">
                  <div className="flex items-center gap-2 mb-4 text-foreground font-semibold">
                    <History className="h-4 w-4 text-muted-foreground" /> Previous Requests
                  </div>
                  <ErrorBoundary fallback={<div className="text-destructive text-sm">Failed to load history</div>}>
                    <div className="opacity-80 hover:opacity-100 transition-opacity">
                      <OutpassList outPasses={outpassHistory.slice(1)} />
                    </div>
                  </ErrorBoundary>
                </div>
              )}
            </div>
          </div>
        </ConditionalRender>

        {/* --- Empty State --- */}
        <ConditionalRender condition={!isLoading && !currentOutpass && !error}>
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 border-2 border-dashed border-muted rounded-2xl bg-card/20 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-muted p-8 rounded-full">
              <ScanBarcode className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">System Ready</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Waiting for input. Please scan the student's digital outpass or manually enter their Roll Number.
              </p>
            </div>
          </div>
        </ConditionalRender>

      </div>
    </div>
  );
}