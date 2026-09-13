"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { ATTENDANCE_THRESHOLD } from "../standing";

export type TrendPoint = { label: string; rate: number };

const config = {
  rate: { label: "Attendance %", color: "var(--chart-1)" },
} satisfies ChartConfig;

export default function TrendChart({ points }: { points: TrendPoint[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      <LineChart data={points} margin={{ top: 8, right: 8, left: -16 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, ATTENDANCE_THRESHOLD, 100]}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <ReferenceLine
          y={ATTENDANCE_THRESHOLD}
          stroke="var(--foreground)"
          strokeDasharray="4 4"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey="rate"
          type="stepAfter"
          stroke="var(--color-rate)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
