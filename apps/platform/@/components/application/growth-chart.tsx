"use client";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer } from 'recharts';
import { GraphDataPoint } from "~/utils/process";



interface MiniChartProps {
    data:GraphDataPoint[];
    type?: 'line' | 'area' | 'bar';
    color?: string;
    trend?: -1 | 0 | 1;
}
// Mini Chart Component
export const MiniChart = ({ data, type = 'area', color = '#8b5cf6', trend = 1 }: MiniChartProps) => {
  const strokeColor = trend === 1 ? '#10b981' : trend === -1 ? '#ef4444' : color;
  const fillColor = trend === 1 ? '#10b981' : trend === -1 ? '#ef4444' : color;

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <Bar
            dataKey="value"
            fill={fillColor}
            opacity={0.6}
            radius={[2, 2, 0, 0]}
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Default: area chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${trend}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={2}
          fill={`url(#gradient-${trend})`}
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

