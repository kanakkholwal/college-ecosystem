"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { Semester } from "~/models/result";

// --- Loader ---
export const CGPIChartLoader: React.FC = () => {
  return (
    <div className="w-full h-[350px] flex flex-col items-center justify-center gap-3 text-muted-foreground/50">
      <Loader2 className="animate-spin size-8" />
      <p className="text-xs font-medium uppercase tracking-wider">Loading Analytics...</p>
    </div>
  );
};

interface CGPIChartProps {
  semesters: Semester[];
}

// --- Configuration ---
const chartConfig: ChartConfig = {
  sgpi: {
    label: "SGPI",
    color: "var(--chart-1)", // Usually a vibrant color like Blue/Cyan
  },
  cgpi: {
    label: "CGPI",
    color: "var(--chart-2)", // Usually a contrast like Purple/Green
  },
};

export const CGPIChart: React.FC<CGPIChartProps> = ({ semesters }) => {
  // 1. Prepare Data
  const chartData = useMemo(() => {
    return semesters.map((sem) => ({
      semester: `Sem ${sem.semester}`,
      shortSem: `S${sem.semester}`, // For mobile axis
      sgpi: Number(sem.sgpi.toFixed(2)),
      cgpi: Number(sem.cgpi.toFixed(2)),
    }));
  }, [semesters]);

  // 2. Calculate Trend (Compare last two semesters)
  const trend = useMemo(() => {
    if (chartData.length < 2) return 0;
    const last = chartData[chartData.length - 1].cgpi;
    const prev = chartData[chartData.length - 2].cgpi;
    return last - prev;
  }, [chartData]);

  return (
    <div>
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold tracking-tight">
              Performance Trend
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              Cumulative vs Semester Performance
            </CardDescription>
          </div>
          
          {/* Trend Badge */}
          {chartData.length > 1 && (
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold",
              trend >= 0 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
            )}>
              {trend >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {trend > 0 ? "+" : ""}{trend.toFixed(2)} vs last sem
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 px-2 sm:px-6">
        <ChartContainer config={chartConfig} className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              {/* Gradients Definitions */}
              <defs>
                <linearGradient id="fillSgpi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sgpi)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-sgpi)" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="fillCgpi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-cgpi)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-cgpi)" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              {/* Grid (Subtle) */}
              <CartesianGrid 
                vertical={false} 
                strokeDasharray="3 3" 
                stroke="hsl(var(--muted-foreground))" 
                strokeOpacity={0.2} 
              />

              {/* Axes */}
              <XAxis
                dataKey="shortSem"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                domain={[0, 10]}
                tickLine={false}
                axisLine={false}
                tickCount={6}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />

              {/* Tooltip */}
              <ChartTooltip
                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    className="w-40 border-border/50 bg-background/95 backdrop-blur-xl shadow-xl"
                  />
                }
              />

              {/* Data Areas */}
              <Area
                type="monotone"
                dataKey="sgpi"
                name="SGPI" // Matches config label
                stroke="var(--color-sgpi)"
                strokeWidth={2}
                fill="url(#fillSgpi)"
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="cgpi"
                name="CGPI"
                stroke="var(--color-cgpi)"
                strokeWidth={3}
                fill="url(#fillCgpi)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-cgpi)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </div>
  );
};

export default CGPIChart;