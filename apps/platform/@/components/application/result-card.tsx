import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Award,
  TrendingDown,
  TrendingUp,
  Trophy
} from "lucide-react";
import Link from "next/link";
import type { ResultTypeWithId } from "src/models/result";

type ResultType = Omit<ResultTypeWithId, "semesters"> & {
  cgpi: number;
  prevCgpi?: number;
};

// --- Helpers ---
const getRankStyle = (rank: number) => {
  if (rank === 1) return "bg-pink-500/10 text-pink-600 border-pink-500/20";
  if (rank === 2) return "bg-rose-400/10 text-rose-600 border-rose-400/20";
  if (rank === 3) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  return "bg-primary/5 text-primary border-primary/20";
};

// --- 1. MAIN RESULT CARD (Standard) ---
export function ResultCard({
  result,
  className,
  ...props
}: { result: ResultType; className?: string }  & React.ComponentProps<"div">) {
  const trend =
    result.prevCgpi !== undefined
      ? result.cgpi - result.prevCgpi
      : 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div>
          <h3 className="font-semibold text-lg leading-tight text-foreground line-clamp-1">
            {result.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                {result.rollNo}
            </span>
            {result.programme && (
                <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="truncate max-w-[120px]">{result.programme}</span>
                </>
            )}
          </div>
        </div>

        {/* Rank Badge */}
        <Badge 
            variant="outline" 
            className={cn("flex items-center gap-1 px-2.5 py-1 text-xs font-semibold", getRankStyle(result.rank.college))}
        >
            {result.rank.college <= 3 ? <Trophy className="size-3" /> : <Award className="size-3" />}
            #{result.rank.college}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
         {/* CGPA Block */}
         <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                CGPI
            </p>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                    {result.cgpi?.toFixed(2)}
                </span>
                {trend !== 0 && (
                    <div className={cn(
                        "flex items-center mb-1.5 text-xs font-medium", 
                        trend > 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                        {trend > 0 ? <TrendingUp className="size-3 mr-0.5" /> : <TrendingDown className="size-3 mr-0.5" />}
                        {Math.abs(trend).toFixed(2)}
                    </div>
                )}
            </div>
         </div>

         {/* Ranks Block */}
         <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Branch</span>
                <span className="font-mono font-medium">#{result.rank.branch}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Batch</span>
                <span className="font-mono font-medium">#{result.rank.batch}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Class</span>
                <span className="font-mono font-medium">#{result.rank.class}</span>
            </div>
         </div>
      </div>

      {/* Footer Action */}
      <div className="relative z-10 pt-4 border-t border-border/40 flex items-center justify-between">
         <span className="text-xs text-muted-foreground font-medium">
            Batch {result.batch || "N/A"}
         </span>
         
         <Link 
            href={`/results/${result.rollNo}`} 
            className="flex items-center gap-1 text-xs font-semibold text-primary opacity-80 hover:opacity-100 transition-opacity"
         >
            View Report <ArrowRight className="size-3" />
         </Link>
      </div>
    </div>
  );
}

// --- 2. MINIMAL CARD (List View) ---
export function ResultCardMinimal({
  result,
  className,
}: { result: ResultType; className?: string }) {
  return (
    <Link
      href={`/results/${result.rollNo}`}
      className={cn(
        "group flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card hover:bg-muted/30 hover:border-primary/20 transition-all",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Rank Circle */}
        <div className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold border",
            getRankStyle(result.rank.college)
        )}>
            #{result.rank.college}
        </div>

        <div>
            <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {result.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                <span className="font-mono">{result.rollNo}</span>
                {result.branch && (
                    <>
                        <span className="text-border">•</span>
                        <span>{result.branch}</span>
                    </>
                )}
            </div>
        </div>
      </div>

      <div className="text-right">
         <span className="block text-lg font-bold tabular-nums text-foreground">
            {result.cgpi?.toFixed(2)}
         </span>
         <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            CGPI
         </span>
      </div>
    </Link>
  );
}

// --- 3. SKELETON ---
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
        </div>
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
            <Skeleton className="h-3 w-8 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
         </div>
         <div className="space-y-2">
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
         </div>
      </div>

      <div className="pt-4 border-t border-border/40 flex justify-between items-center">
         <Skeleton className="h-3 w-16 rounded-md" />
         <Skeleton className="h-3 w-20 rounded-md" />
      </div>
    </div>
  );
}