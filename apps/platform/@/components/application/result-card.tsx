import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowRight, Award, Calendar, GraduationCap, TrendingDown, TrendingUp, TrendingUpDown, Trophy } from "lucide-react";
import Link from "next/link";
import type { ResultTypeWithId } from "src/models/result";

type ResultType = Omit<ResultTypeWithId, "semesters"> & {
  cgpi: number;
  prevCgpi?: number;
};
const getRankColor = (rank: number) => {
  if (rank === 1)
    return "from-[#FEE140] to-[#FA709A]"; // gold-pink
  if (rank === 2)
    return "from-[#89F7FE] to-[#66A6FF]"; // icy blue-silver
  if (rank === 3)
    return "from-[#FAD961] to-[#F76B1C]"; // bronze-orange
  return "from-[#6EE7B7] to-[#3B82F6]"; // default vibrant teal-blue
};

const getCgpiTrendColor = (cgpi: number, prevCgpi?: number) => {
  if (prevCgpi === undefined) return "text-muted-foreground";
  if (cgpi > prevCgpi) return "text-emerald-600 dark:text-emerald-400";
  if (cgpi < prevCgpi) return "text-rose-600 dark:text-rose-400";
  return "text-muted-foreground";
};


export function ResultCard({
  result,
  ...props
}: { result: ResultType } & React.ComponentProps<typeof Card>) {
  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 bg-card"
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute top-2 right-2 flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full",
          result.rank.college <= 3 ? getRankColor(result.rank.college) :
            " bg-primary/10 border border-primary/20",
          result.rank.college <= 3 ? " bg-gradient-to-br" : "",

        )}>
          {result.rank.college <= 3 ? (
            <Trophy className="size-3 text-white" />
          ) : <Award className="size-3 text-primary" />}

          <span className={cn("text-xs font-semibold", result.rank.college <= 3 ? "text-white" : " text-primary")}>#{result.rank.college}</span>
        </div>
      </div>


      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-foreground mb-0.5 truncate">

              {result.name}
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <span className="flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-primary/60" />
                {result.rollNo}
              </span>
              {result.programme && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {result.programme}
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/50 rounded-lg p-2 text-center transition-colors hover:bg-muted">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Batch</p>
            <p className="text-base font-bold text-foreground">{result.rank.batch}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center transition-colors hover:bg-muted">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Branch</p>
            <p className="text-base font-bold text-foreground">{result.rank.branch}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center transition-colors hover:bg-muted">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Class</p>
            <p className="text-base font-bold text-foreground">{result.rank.class}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          {result?.prevCgpi !== undefined && (
            <>
              {result.cgpi > result.prevCgpi ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              ) : result.cgpi < result.prevCgpi ? (
                <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              ) : (
                <TrendingUpDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </>
          )}
          <div>
            <p className="text-xs text-muted-foreground font-medium leading-none mb-0.5">CGPI</p>
            <p className={cn("text-base font-bold leading-none", getCgpiTrendColor(result.cgpi, result.prevCgpi))}>
              {result?.cgpi?.toFixed(2) ?? "0.00"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="flex-1"
          transition="damped"
          variant="default_light"
          asChild
        >
          <Link href={`/results/${result.rollNo}`} prefetch={false}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export function ResultCardDetailed({
  result,
  ...props
}: { result: ResultType } & React.ComponentProps<typeof Card>) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden" {...props}>
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-base text-foreground mb-1">
              {result.name}
            </h3>
            <p className="text-xs text-muted-foreground">{result.rollNo}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            Rank #{result.rank.college}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2">
          {result.programme && (
            <Badge variant="outline" className="text-xs">
              {result.programme}
            </Badge>
          )}
          {result.batch && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {result.batch}
            </Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Branch Rank</p>
            <p className="text-lg font-bold text-foreground">#{result.rank.branch}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Batch Rank</p>
            <p className="text-lg font-bold text-foreground">#{result.rank.batch}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Class Rank</p>
            <p className="text-lg font-bold text-foreground">#{result.rank.class}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">CGPI</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {result?.cgpi?.toFixed(2) ?? "0.00"}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" size="sm" asChild>
          <Link href={`/results/${result.rollNo}`} prefetch={false}>
            View Full Results
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ResultCardMinimal({
  result,
  ...props
}: { result: ResultType } & React.ComponentProps<typeof Card>) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/50" {...props}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {result.rank.college}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">{result.name}</h3>
              <p className="text-xs text-muted-foreground">{result.rollNo}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {result?.cgpi?.toFixed(2)}
            </div>
            <div className="text-[10px] text-muted-foreground">CGPI</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-4 text-muted-foreground">
            <span>Batch: <strong className="text-foreground">{result.rank.batch}</strong></span>
            <span>Branch: <strong className="text-foreground">{result.rank.branch}</strong></span>
            <span>Class: <strong className="text-foreground">{result.rank.class}</strong></span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <Link href={`/results/${result.rollNo}`} prefetch={false}>
              View
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton Components
export function SkeletonCard() {
  return (
    <Card className="relative overflow-hidden border-border/50">
      <div className="absolute top-2 right-2">
        <Skeleton className="w-14 h-5 rounded-full" />
      </div>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-2 text-center space-y-1">
              <Skeleton className="h-3 w-10 mx-auto" />
              <Skeleton className="h-4 w-6 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-1 flex items-center justify-between gap-2">
        <Skeleton className="h-11 w-20 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-md" />
      </CardFooter>
    </Card>
  );
}

