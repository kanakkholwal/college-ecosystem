"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LoaderCircle } from "lucide-react";
import type React from "react";
import { Suspense } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Semester } from "~/models/result";

export const CGPIChartLoader: React.FC = () => {
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <LoaderCircle className="animate-spin size-10 text-primary" />
    </div>
  );
};

interface CGPIChartProps {
  semesters: Semester[];
}

export const CGPIChart: React.FC<CGPIChartProps> = ({ semesters }) => {
  const chartData = semesters.map((semester: Semester) => ({
    semester: `Sem ${semester.semester}`,
    SGPI: Number.parseFloat(semester.sgpi.toFixed(2)),
    CGPI: Number.parseFloat(semester.cgpi.toFixed(2)),
  }))

  const chartConfig: ChartConfig = {
    SGPI: {
      label: "SGPI",
      color: "var(--chart-1)",
    },
    CGPI: {
      label: "CGPI",
      color: "var(--chart-2)",
    },
  };

  return (
    <Card className="rounded-2xl shadow-lg border border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Academic Performance Overview
        </CardTitle>
        <CardDescription>
          Track how your <span className="font-medium">Semester GPA (SGPI)</span> and{" "}
          <span className="font-medium">Cumulative GPA (CGPI)</span> evolve across semesters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<CGPIChartLoader />}>
          <ChartContainer config={chartConfig} className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 16, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-primary bg-primary/10" />
                <XAxis
                  dataKey="semester"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                />
                <YAxis
                  domain={[0, 10]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                />
                <Line
                  type="monotone"
                  dataKey="SGPI"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--chart-1)" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="CGPI"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  strokeOpacity={0.7}
                  dot={{ r: 4, fill: "var(--chart-2)", opacity: 0.7 }}
                  activeDot={{ r: 6 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default CGPIChart;
