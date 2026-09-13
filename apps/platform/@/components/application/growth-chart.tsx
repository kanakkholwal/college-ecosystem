"use client";
import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import type { GraphDataPoint } from "~/utils/process";

interface MiniChartProps {
  data: GraphDataPoint[];
  type?: "line" | "area" | "bar";
  color?: string;
  trend?: -1 | 0 | 1;
}

/** Decorative sparkline; pair it with the number it summarises, since it is hidden from assistive tech. */
export const MiniChart = ({
  data,
  type = "area",
  color = "var(--chart-1)",
  trend = 1,
}: MiniChartProps) => {
  const gradientId = useId().replace(/:/g, "");
  const stroke =
    trend === 1
      ? "var(--success)"
      : trend === -1
        ? "var(--destructive)"
        : color;

  if (type === "line") {
    return (
      <div aria-hidden="true" className="size-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="count"
              stroke={stroke}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "bar") {
    return (
      <div aria-hidden="true" className="size-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar
              dataKey="count"
              fill={stroke}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="size-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.24} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="count"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
