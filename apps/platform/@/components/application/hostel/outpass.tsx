"use client";

import { OutpassActionFooter } from "@/components/application/hostel/outpass-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ArrowRight,
  BedDouble,
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  XCircle
} from "lucide-react";
import type { OutPassType } from "~/models/hostel_n_outpass";

interface OutpassDetailsProps {
  outpass: OutPassType;
  actionEnabled?: boolean;
}

// 1. Configuration for Status Colors
const statusConfig = {
  approved: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50/50 dark:bg-emerald-900/10",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 hover:bg-emerald-200",
    icon: CheckCircle2,
  },
  pending: {
    border: "border-l-amber-500",
    bg: "bg-amber-50/50 dark:bg-amber-900/10",
    text: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 hover:bg-amber-200",
    icon: Clock,
  },
  rejected: {
    border: "border-l-rose-500",
    bg: "bg-rose-50/50 dark:bg-rose-900/10",
    text: "text-rose-700 dark:text-rose-400",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100 hover:bg-rose-200",
    icon: XCircle,
  },
  processed: {
    border: "border-l-blue-500",
    bg: "bg-blue-50/50 dark:bg-blue-900/10",
    text: "text-blue-700 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200",
    icon: CheckCircle2,
  },
  in_use: {
    border: "border-l-indigo-500",
    bg: "bg-indigo-50/50 dark:bg-indigo-900/10",
    text: "text-indigo-700 dark:text-indigo-400",
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100 hover:bg-indigo-200",
    icon: MapPin,
  },
  // Fallback
  default: {
    border: "border-l-muted",
    bg: "bg-card",
    text: "text-muted-foreground",
    badge: "secondary",
    icon: Clock,
  }
};

export function OutpassDetails({
  outpass,
  actionEnabled = false,
}: OutpassDetailsProps) {
  const theme = statusConfig[outpass.status] || statusConfig.default;
  const StatusIcon = theme.icon;

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-200 hover:shadow-md border-l-[4px]",
      theme.border
    )}>
      
      {/* --- Header: Identity & Status --- */}
      <div className="p-4 flex justify-between items-start gap-3">
        <div className="flex gap-3 overflow-hidden">
          <Avatar className="h-10 w-10 border border-border shrink-0">
             {/* Fallback if no image available */}
            {/* <AvatarImage src={outpass.student?.name} alt={outpass.student?.name} /> */}
            <AvatarFallback className="bg-muted text-muted-foreground">
              {outpass.student?.name?.slice(0, 2).toUpperCase() || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col min-w-0">
            <h4 className="font-semibold text-sm leading-none truncate text-foreground" title={outpass.student?.name}>
              {outpass.student?.name || "Unknown Student"}
            </h4>
            <span className="text-xs text-muted-foreground font-mono mt-1">
              {outpass.student?.rollNumber}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <Badge className={cn("uppercase text-[10px] font-bold tracking-wider gap-1.5 pl-1.5 pr-2.5 h-6 shadow-none border-0", theme.badge)}>
          <StatusIcon className="h-3 w-3" />
          {outpass.status}
        </Badge>
      </div>

      <Separator className="opacity-50" />

      {/* --- Body: Trip Details --- */}
      <div className="p-4 space-y-4">
        
        {/* Location Grid */}
        <div className="grid grid-cols-2 gap-3">
             <div className="flex flex-col gap-1 bg-muted/40 p-2 rounded-md">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <BedDouble className="h-3 w-3" /> Hostel
                </span>
                <span className="text-xs font-medium truncate" title={`${outpass.hostel.name} - ${outpass.roomNumber}`}>
                    {outpass.hostel.name} <span className="text-muted-foreground">#{outpass.roomNumber}</span>
                </span>
             </div>
             <div className="flex flex-col gap-1 bg-muted/40 p-2 rounded-md">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Destination
                </span>
                 <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <span className="text-xs font-medium truncate cursor-help">
                            {outpass.address}
                         </span>
                      </TooltipTrigger>
                      <TooltipContent><p>{outpass.address}</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
             </div>
        </div>

        {/* Reason Text */}
        <div className="text-xs">
            <span className="text-muted-foreground">Reason: </span>
            <span className="font-medium text-foreground">{outpass.reason}</span>
        </div>

        {/* Timeline Visual */}
        <div className={cn("rounded-lg border p-3 flex items-center justify-between", theme.bg)}>
            {/* Out Time */}
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Leaving</span>
                <div className="flex items-center gap-1.5">
                    <CalendarClock className={cn("h-3.5 w-3.5", theme.text)} />
                    <span className="text-xs font-semibold">
                         {format(new Date(outpass.expectedOutTime || ""), "dd MMM, HH:mm")}
                    </span>
                </div>
            </div>

            {/* Direction Arrow */}
            <ArrowRight className={cn("h-4 w-4 opacity-40", theme.text)} />

            {/* In Time */}
            <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Returning</span>
                <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-semibold">
                         {format(new Date(outpass.expectedInTime || ""), "dd MMM, HH:mm")}
                    </span>
                    <CalendarClock className={cn("h-3.5 w-3.5", theme.text)} />
                </div>
            </div>
        </div>
      </div>

      {/* --- Footer: Actions --- */}
      {/* Logic: 
         1. If "Pending" AND actionEnabled -> Show Action Buttons (Approve/Reject).
         2. Else, preserve the visual space or show Checkbox if enabled for other statuses.
      */}
      {actionEnabled && (
         <div className="bg-muted/20 px-4 py-3 border-t flex items-center justify-between gap-3">
             
             {/* If Pending, show the Footer Actions (Approve/Reject buttons presumably) */}
             {outpass.status === "pending" ? (
                 <div className="w-full">
                     <OutpassActionFooter outpassId={outpass._id} />
                 </div>
             ) : (
                 <div className="text-[10px] text-muted-foreground italic w-full text-center py-1">
                    {outpass.status === 'approved' ? "Action completed" : "No actions available"}
                 </div>
             )}

             {/* Checkbox (Preserved from original code) */}
             {/* Only show checkbox if it's not pending (since pending has buttons), 
                 OR if you want to allow bulk selection of pending items too. 
                 Positioning it to the side. */}
             <div className="shrink-0">
                <Checkbox 
                    className="h-5 w-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    checked={outpass.status === "approved"} // Kept original logic
                    onCheckedChange={() => {}} // Add handler if needed
                />
             </div>
         </div>
      )}

      {/* Hover Menu (Optional Enhancement) */}
      {/* <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <Button variant="ghost" size="icon" className="h-8 w-8">
             <MoreVertical className="h-4 w-4" />
         </Button>
      </div> */}

    </Card>
  );
}