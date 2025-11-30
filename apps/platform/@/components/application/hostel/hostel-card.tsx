import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    ArrowRight,
    Building2,
    Lock,
    ShieldCheck,
    Users
} from "lucide-react";
import Link from "next/link";
import type { HostelType } from "~/models/hostel_n_outpass";


interface HostelCardProps {
  hostel: HostelType;
  href: string;
  disabled: boolean;
}



export function HostelCard({ hostel, href, disabled }: HostelCardProps) {
  const isGirls = hostel.gender === "female";

  // Visual Theme Configuration (Subtle Accents)
  const theme = {
    accentBar: isGirls ? "bg-rose-500" : "bg-indigo-500",
    iconBox: isGirls
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    hoverBorder: isGirls
      ? "hover:border-rose-500/20"
      : "hover:border-indigo-500/20",
  };

  const CardWrapper = disabled ? "div" : Link;

  return (
    <CardWrapper
      href={href}
      className={cn(
        "group block h-full outline-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary",
        disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"
      )}
    >
      <Card className={cn(
        "h-full flex flex-col overflow-hidden border-border/50 bg-card transition-all duration-300",
        !disabled && `hover:shadow-md hover:-translate-y-1 ${theme.hoverBorder}`
      )}>


        <CardHeader className="pb-2 pt-5 px-5 space-y-0">
          <div className="flex justify-between items-start">
            <div className={cn("flex items-center justify-center size-10 rounded-lg transition-colors", theme.iconBox)}>
              <Building2 className="size-5" />
            </div>

            {disabled ? (
              <Badge variant="secondary" className="gap-1.5 bg-muted text-muted-foreground border-transparent">
                <Lock className="size-3" /> Restricted
              </Badge>
            ) : (
              <Badge variant="outline" className="capitalize font-medium text-[10px] px-2 py-0.5 h-5 border-border/60 text-muted-foreground">
                {hostel.gender}
              </Badge>
            )}
          </div>

          <div className="mt-4 space-y-1">
            <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {hostel.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono opacity-70">
              #{hostel.slug.toUpperCase()}
            </p>
          </div>
        </CardHeader>

        {/* 3. Body Content */}
        <CardContent className="flex-1 px-5 py-2">
          {/* Warden Chip */}
          <div className="mt-2 p-2.5 rounded-lg border border-border/40 bg-muted/20 flex items-center gap-3 transition-colors group-hover:bg-muted/40">
            <Avatar className="size-8 border shadow-sm">
              <AvatarImage src={hostel.warden.name} alt={hostel.warden.name} />
              <AvatarFallback className="text-[10px] font-bold bg-background text-muted-foreground">
                {hostel.warden.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1">
                <ShieldCheck className="size-3" /> Chief Warden
              </span>
              <span className="text-xs font-medium truncate text-foreground/90">
                {hostel.warden.name}
              </span>
            </div>
          </div>
        </CardContent>

        {/* 4. Footer */}
        <CardFooter className="px-5 py-4 border-t border-border/40 bg-muted/5 flex justify-between items-center min-h-[3.5rem]">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Users className="size-3.5 opacity-70" />
            <span>{hostel.administrators?.length || 0} Staff</span>
          </div>

          {!disabled && (
            <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              Manage <ArrowRight className="size-3.5" />
            </div>
          )}
        </CardFooter>
      </Card>
    </CardWrapper>
  );
}

export function HostelGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[380px] rounded-xl border bg-card p-6 space-y-6">
          <div className="flex justify-between items-start">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full rounded-md mt-auto" />
        </div>
      ))}
    </div>
  );
}