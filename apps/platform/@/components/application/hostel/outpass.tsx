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
  Hash,
  MapPin,
  User,
  XCircle,
} from "lucide-react";
import type { OutPassType } from "~/models/hostel_n_outpass";

interface OutpassDetailsProps {
  outpass: OutPassType;
  actionEnabled?: boolean;
}

// 1. Configuration for Status Colors (Using primary brand colors for subtlety)
const statusConfig = {
  approved: {
    accent: "text-emerald-500",
    bg: "bg-emerald-50/70 dark:bg-emerald-950/20",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  pending: {
    accent: "text-amber-500",
    bg: "bg-amber-50/70 dark:bg-amber-950/20",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    icon: Clock,
  },
  rejected: {
    accent: "text-rose-500",
    bg: "bg-rose-50/70 dark:bg-rose-950/20",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    icon: XCircle,
  },
  processed: {
    accent: "text-blue-500",
    bg: "bg-blue-50/70 dark:bg-blue-950/20",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: CheckCircle2,
  },
  in_use: {
    accent: "text-indigo-500",
    bg: "bg-indigo-50/70 dark:bg-indigo-950/20",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    icon: MapPin,
  },
  // Fallback
  default: {
    accent: "text-muted-foreground",
    bg: "bg-muted/50",
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

  // Helper component for consistent info rows
  const InfoRow = ({ Icon, label, value, tooltipContent }: { Icon: React.ElementType, label: string, value: string, tooltipContent?: string }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground/80">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-sm font-semibold text-right max-w-[60%] truncate">
        {tooltipContent ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">{value}</span>
              </TooltipTrigger>
              <TooltipContent><p>{tooltipContent}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span>{value}</span>
        )}
      </div>
    </div>
  );

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 rounded-xl",
      "hover:shadow-lg hover:ring-1 hover:ring-border", // Soft shadow and border on hover for elevation
    )}>
      
      {/* Subtle Status Indicator Line (Modern Alternative to Thick Border) */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-1", 
        theme.bg, // Use background color
        theme.accent // Use text color for a subtle accent line
      )}>
        <div className={cn("h-full w-1/4", theme.accent)}></div> {/* Small color accent dot/line on the left */}
      </div>

      {/* --- Header: Student Identity & Status --- */}
      <div className="p-5 pt-6 flex justify-between items-center gap-3">
        <div className="flex gap-3 items-center overflow-hidden">
          <Avatar className="h-11 w-11 border border-border/50 shrink-0"> 
            <AvatarFallback className="bg-primary/5 text-primary font-bold text-base">
              {outpass.student?.name?.slice(0, 2).toUpperCase() || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-base leading-snug truncate text-foreground" title={outpass.student?.name}> 
              {outpass.student?.name || "Unknown Student"}
            </h3>
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
              <Hash className="h-3 w-3 opacity-60" /> {outpass.student?.rollNumber}
            </span>
          </div>
        </div>

        {/* Status Badge - Subtle, high-contrast text */}
        <Badge className={cn("uppercase text-[10px] font-bold tracking-wider gap-1.5 pl-2 pr-3 h-6 shadow-none border-0 transition-colors", theme.badge)}>
          <StatusIcon className={cn("h-3 w-3", theme.accent)} />
          {outpass.status.replace(/_/g, ' ')} 
        </Badge>
      </div>

      <Separator className="opacity-50 mx-5 w-auto" />

      {/* --- Body: Trip Details (Date, Location, Reason) --- */}
      <div className="p-5 space-y-5">
        
        {/* Timeline Visual - Using theme background for emphasis */}
        <div className={cn("rounded-lg p-4 flex items-center justify-between border", theme.bg)}>
          
          {/* Out Time */}
          <div className="flex flex-col">
            <span className="text-[11px] uppercase font-semibold text-muted-foreground mb-1">Departure</span>
            <div className="flex items-center gap-2">
              <CalendarClock className={cn("h-4 w-4", theme.accent)} />
              <div className="flex flex-col text-sm">
                <span className="font-bold leading-none">{format(new Date(outpass.expectedOutTime || ""), "dd MMM")}</span>
                <span className="text-xs font-medium text-muted-foreground/90">{format(new Date(outpass.expectedOutTime || ""), "HH:mm")}</span>
              </div>
            </div>
          </div>

          {/* Direction Arrow */}
          <ArrowRight className={cn("h-4 w-4 opacity-50", theme.accent)} />

          {/* In Time */}
          <div className="flex flex-col text-right">
            <span className="text-[11px] uppercase font-semibold text-muted-foreground mb-1">Return</span>
            <div className="flex items-center justify-end gap-2">
              <div className="flex flex-col text-sm">
                <span className="font-bold leading-none">{format(new Date(outpass.expectedInTime || ""), "dd MMM")}</span>
                <span className="text-xs font-medium text-muted-foreground/90">{format(new Date(outpass.expectedInTime || ""), "HH:mm")}</span>
              </div>
              <CalendarClock className={cn("h-4 w-4", theme.accent)} />
            </div>
          </div>
        </div>

        {/* Location & Reason List */}
        <div className="space-y-3 pt-1">
          
          <InfoRow 
            Icon={BedDouble} 
            label="Hostel/Room" 
            value={`${outpass.hostel.name} #${outpass.roomNumber}`} 
          />

          <InfoRow 
            Icon={MapPin} 
            label="Destination" 
            value={outpass.address} 
            tooltipContent={outpass.address}
          />
        
          <div className="text-sm pt-2">
              <p className="font-semibold text-foreground/90 mb-1">Reason:</p>
              <blockquote className="text-muted-foreground/90 italic text-[13px] leading-snug">
                {outpass.reason}
              </blockquote>
          </div>
        </div>
      </div>

      {/* --- Footer: Actions / Status Log --- */}
      {actionEnabled && (
          <div className="bg-muted/30 px-5 py-3 border-t flex items-center justify-between gap-4">
              
              {/* Conditional Action Buttons or Status Message */}
              {outpass.status === "pending" ? (
                  <div className="w-full">
                      {/* OutpassActionFooter should contain clear, full-width Approve/Reject buttons */}
                      <OutpassActionFooter outpassId={outpass._id} />
                  </div>
              ) : (
                  <div className="text-xs text-muted-foreground italic w-full text-center py-1">
                      {outpass.status === 'approved' ? "Action completed. Outpass is valid." : 
                       outpass.status === 'rejected' ? "Request has been rejected." : 
                       "No immediate actions required."}
                  </div>
              )}

              {/* Checkbox for bulk selection */}
              <div className="shrink-0 pl-4 border-l border-border/80">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Checkbox 
                            aria-label="Select Outpass"
                            className="h-4 w-4 border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-colors"
                            checked={false} 
                            onCheckedChange={() => {}} 
                        />
                      </TooltipTrigger>
                      <TooltipContent><p>Select for bulk action</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
              </div>
          </div>
      )}

    </Card>
  );
}