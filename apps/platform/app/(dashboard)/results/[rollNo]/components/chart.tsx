"use client";
import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer } from "@/components/ui/chart";
import { Semester } from "src/models/result";

export const CGPIChartLoader: React.FC = () => {
  return (
    <div className="w-full relative">
      <Skeleton className="w-full h-full min-h-64" />
    </div>
  );
};

interface CGPIChartProps {
  semesters: Semester[];
}

export const CGPIChart: React.FC<CGPIChartProps> = ({ semesters }) => {
  const chartData = semesters.map((semester: Semester) => {
    return {
      semester: `Semester ${semester.semester}`,
      sgpi: parseFloat(semester.sgpi.toFixed(2)),
      cgpi: parseFloat(semester.cgpi.toFixed(2)),
    };
  });

  const chartConfig = {
    sgpi: {
      label: "SGPI",
      color: "hsl(var(--primary))",
    },
    cgpi: {
      label: "CGPI",
      color: "hsl(var(--primary) / 0.5)",
    },
  } as ChartConfig;

  return (
    <>
      <Suspense fallback={<CGPIChartLoader />}>
        <ChartContainer
          config={chartConfig}
          className="w-full aspect-video relative z-10"
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="semester" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="sgpi" fill={chartConfig.sgpi.color} radius={4} />
            <Bar dataKey="cgpi" fill={chartConfig.cgpi.color} radius={4} />
          </BarChart>
        </ChartContainer>
      </Suspense>
    </>
  );
};

export default CGPIChart;
