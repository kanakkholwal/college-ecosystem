import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Home,
  MapPin,
  MoreHorizontal,
  Navigation,
  Timer,
  XCircle
} from "lucide-react";
import { notFound } from "next/navigation";
import { getOutPassByIdForHosteler } from "~/actions/hostel.outpass";
import type { OutPassType } from "~/models/hostel_n_outpass";

interface PageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function StudentOutpassHistoryPage({ params }: PageProps) {
  const { studentId } = await params;
  const outpassResponse = await getOutPassByIdForHosteler(studentId);

  if (!outpassResponse.data || outpassResponse.data.length === 0) {
    if (!outpassResponse.data) return notFound();
  }

  const outpasses = outpassResponse.data;
  const student = outpasses[0]?.student;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* --- Page Header --- */}
      {student && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-border/60">
          <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {student.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{student.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground/80">{student.rollNumber}</span>
                <span className="hidden sm:inline">•</span>
                <span>{student.email}</span>
            </div>
          </div>
        </div>
      )}

      <ErrorBoundaryWithSuspense
        loadingFallback={<div className="p-8 text-center text-muted-foreground">Loading outpass history...</div>}
        fallback={<div className="p-8 text-center text-muted-foreground">Unable to load history</div>}
      >
        <div className="grid gap-6">
            {outpasses.map((pass) => (
                <OutpassCard key={pass._id} pass={pass} />
            ))}
            
            {outpasses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl bg-muted/5 text-muted-foreground">
                    <CalendarDays className="h-10 w-10 mb-3 opacity-20" />
                    <p>No outpass history found.</p>
                </div>
            )}
        </div>
      </ErrorBoundaryWithSuspense>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENT: The Clean Card
// ----------------------------------------------------------------------

function OutpassCard({ pass }: { pass: OutPassType }) {
    const statusConfig = getStatusConfig(pass.status);
    const StatusIcon = statusConfig.icon;
    const isLateReturn = isLate(pass);

    return (
        <Card className="overflow-hidden border border-border/60 shadow-sm transition-all hover:shadow-md hover:border-border/80 group">
            
            {/* --- Card Header: Meta Data --- */}
            <div className="bg-muted/30 border-b border-border/50 px-5 py-3 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                    {/* Reason Label */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                         <span className="capitalize">{pass.reason}</span>
                    </div>
                    
                    <span className="text-muted-foreground/40 text-xs">•</span>
                    
                    {/* Date */}
                    <span className="text-xs text-muted-foreground font-medium">
                        REQ: {format(new Date(pass.createdAt || ""), "dd MMM yyyy")}
                    </span>
                </div>

                {/* Status Pill */}
                <Badge variant="outline" className={cn("pl-1.5 pr-2.5 py-0.5 gap-1.5 border shadow-none font-medium transition-colors", statusConfig.badge)}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span className="capitalize">{pass.status.replace("_", " ")}</span>
                </Badge>
            </div>

            {/* --- Card Body: Timeline & Details --- */}
            <div className="p-5 grid md:grid-cols-[1.2fr_1fr] gap-8">
                
                {/* COLUMN 1: Visual Timeline */}
                <div className="relative pl-2">
                    {/* Vertical Line Connector */}
                    <div className="absolute left-[15px] top-3 bottom-4 w-[2px] bg-border/60 -z-10" />

                    <div className="space-y-8">
                        
                        {/* Point A: Departure */}
                        <div className="flex gap-4 items-start">
                            <div className="h-7 w-7 rounded-full bg-background border-2 border-muted-foreground/30 flex items-center justify-center shrink-0 z-10 shadow-sm">
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Leaving</span>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-foreground">
                                        {format(new Date(pass.expectedOutTime), "EEE, dd MMM • hh:mm a")}
                                    </p>
                                </div>
                                {/* Actual Out Subtext */}
                                {pass.actualOutTime && (
                                     <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 bg-muted/40 px-2 py-0.5 rounded w-fit">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                        Actual: {format(new Date(pass.actualOutTime), "hh:mm a")}
                                     </p>
                                )}
                            </div>
                        </div>

                        {/* Point B: Return */}
                        <div className="flex gap-4 items-start">
                            <div className={cn(
                                "h-7 w-7 rounded-full bg-background border-2 flex items-center justify-center shrink-0 z-10 shadow-sm transition-colors",
                                isLateReturn ? "border-red-200" : "border-muted-foreground/30"
                            )}>
                                <Home className={cn("h-3.5 w-3.5", isLateReturn ? "text-red-500" : "text-muted-foreground")} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Returning</span>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-foreground">
                                        {format(new Date(pass.expectedInTime), "EEE, dd MMM • hh:mm a")}
                                    </p>
                                </div>
                                {/* Actual In Subtext */}
                                {pass.actualInTime && (
                                     <p className={cn(
                                         "text-xs flex items-center gap-1.5 mt-1 bg-muted/40 px-2 py-0.5 rounded w-fit",
                                         isLateReturn ? "text-red-600 bg-red-50 dark:bg-red-950/20" : "text-muted-foreground"
                                     )}>
                                        {isLateReturn ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                                        Actual: {format(new Date(pass.actualInTime), "hh:mm a")}
                                     </p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* COLUMN 2: Destination & Context */}
                <div className="flex flex-col justify-center space-y-5 bg-muted/10 rounded-lg p-4 border border-border/30">
                     
                     <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <MapPin className="h-3.5 w-3.5" /> Destination
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                            {pass.address}
                        </p>
                     </div>

                     <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <Navigation className="h-3.5 w-3.5" /> Duration
                        </div>
                        <p className="text-sm font-medium text-foreground/80">
                            {getDuration(pass.expectedOutTime, pass.expectedInTime)}
                        </p>
                     </div>

                     <div className="pt-2 mt-auto">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="px-1.5 py-0.5 rounded border bg-background">
                                Room {pass.roomNumber}
                            </span>
                            <span>{pass.hostel.name}</span>
                        </div>
                     </div>

                </div>

            </div>
        </Card>
    );
}


// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

function isLate(pass: OutPassType) {
    if (!pass.actualInTime) return false;
    return new Date(pass.actualInTime) > new Date(pass.expectedInTime);
}

function getDuration(start: Date, end: Date) {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.round(((diffMs % 3600000) / 60000));
    
    if (diffHrs > 24) return `${Math.floor(diffHrs / 24)} Days ${diffHrs % 24} Hrs`;
    if (diffHrs > 0) return `${diffHrs} Hr ${diffMins > 0 ? `${diffMins} Min` : ""}`;
    return `${diffMins} Minutes`;
}

function getStatusConfig(status: string) {
    switch (status) {
        case "approved":
        case "processed":
            return {
                badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
                icon: CheckCircle2
            };
        case "rejected":
            return {
                badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900",
                icon: XCircle
            };
        case "in_use":
            return {
                badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
                icon: Timer
            };
        default: // pending
            return {
                badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
                icon: MoreHorizontal
            };
    }
}