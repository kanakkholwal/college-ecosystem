"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TIME_INTERVALS } from "~/utils/process";

export interface DataPoint {
  timestamp: Date;
  [key: string]: Date | number;
}

export interface ChartSeries {
  dataKey: string;
  label: string;
  color?: string;
  showInLegend?: boolean;
}

export interface GenericAreaChartProps {
  data: DataPoint[];
  series: ChartSeries[];

  title?: string;
  description?: string;
  className?: string;
  /** Screen-reader summary of what the chart shows; say the takeaway, not the pixels. */
  summary?: string;
  /** Heading level for the title, so the card fits the page outline. */
  titleAs?: "h2" | "h3";

  showTimeRangeFilter?: boolean;
  timeRangeOptions?: Array<{
    value: string;
    label: string;
    days: number;
  }>;
  defaultTimeRange?: string;
  onTimeRangeChange?: (value: string) => void;

  chartHeight?: number;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  curveType?: "monotone" | "natural" | "linear" | "step";

  /** Serialisable alternative to `xAxisFormatter` for server-rendered callers. */
  xAxisFormat?: "date" | "time" | "month";
  xAxisFormatter?: (value: Date) => string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number | string, name: string) => string | number;

  gradientOpacity?: {
    start: number;
    end: number;
  };

  emptyStateMessage?: string;
}

const X_FORMATS: Record<
  NonNullable<GenericAreaChartProps["xAxisFormat"]>,
  Intl.DateTimeFormatOptions
> = {
  date: { month: "short", day: "numeric" },
  time: { hour: "numeric", minute: "2-digit" },
  month: { month: "short", year: "numeric" },
};

const formatterFor =
  (format: NonNullable<GenericAreaChartProps["xAxisFormat"]>) =>
  (value: Date) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return format === "time"
      ? date.toLocaleTimeString("en-IN", X_FORMATS.time)
      : date.toLocaleDateString("en-IN", X_FORMATS[format]);
  };

const defaultYAxisFormatter = (value: number) => value.toLocaleString("en-IN");

export function GenericAreaChart({
  data,
  series,
  title,
  description,
  className = "",
  summary,
  titleAs: Title = "h3",
  showTimeRangeFilter = false,
  timeRangeOptions = TIME_INTERVALS,
  defaultTimeRange = "last_month",
  onTimeRangeChange,
  chartHeight = 250,
  showGrid = true,
  showXAxis = true,
  showYAxis = false,
  showLegend = true,
  stacked = false,
  curveType = "monotone",
  xAxisFormat = "date",
  xAxisFormatter,
  yAxisFormatter,
  gradientOpacity = { start: 0.24, end: 0.02 },
  emptyStateMessage = "No data yet",
}: GenericAreaChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [timeRange, setTimeRange] = React.useState<string>(
    searchParams.get("period") ?? defaultTimeRange
  );
  const gradientId = React.useId().replace(/:/g, "");

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    series.forEach((s, index) => {
      config[s.dataKey] = {
        label: s.label,
        color: s.color || `var(--chart-${index + 1})`,
      };
    });
    return config;
  }, [series]);

  const chartData = React.useMemo(
    () =>
      data.map((item) => ({
        ...item,
        date: new Date(item.timestamp).toISOString(),
      })),
    [data]
  );

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    onTimeRangeChange?.(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const formatX = xAxisFormatter || formatterFor(xAxisFormat);
  const hasHeader = Boolean(title || description || showTimeRangeFilter);

  return (
    <figure
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background",
        className
      )}
    >
      {hasHeader && (
        <figcaption className="flex flex-wrap items-start justify-between gap-3">
          {(title || description) && (
            <div className="min-w-0 space-y-1">
              {title && (
                <Title className="text-body-lg font-medium text-foreground">
                  {title}
                </Title>
              )}
              {description && (
                <p className="text-body text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          {showTimeRangeFilter && (
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="h-9 w-40" aria-label="Time range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </figcaption>
      )}
      {summary && <p className="sr-only">{summary}</p>}

      {data.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-xl border border-dashed border-border"
          style={{ height: chartHeight }}
        >
          <p className="text-body text-muted-foreground">{emptyStateMessage}</p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full"
          style={{ height: `${chartHeight}px` }}
        >
          <AreaChart
            data={chartData}
            accessibilityLayer
            margin={{ left: 0, right: 8 }}
          >
            <defs>
              {series.map((s, index) => {
                const color = s.color || `var(--chart-${index + 1})`;
                return (
                  <linearGradient
                    key={s.dataKey}
                    id={`${gradientId}-${s.dataKey}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={color}
                      stopOpacity={gradientOpacity.start}
                    />
                    <stop
                      offset="95%"
                      stopColor={color}
                      stopOpacity={gradientOpacity.end}
                    />
                  </linearGradient>
                );
              })}
            </defs>

            {showGrid && (
              <CartesianGrid vertical={false} stroke="var(--border)" />
            )}
            {showXAxis && (
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => formatX(new Date(value))}
              />
            )}
            {showYAxis && (
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
                allowDecimals={false}
                tickFormatter={yAxisFormatter || defaultYAxisFormatter}
              />
            )}
            <ChartTooltip
              cursor={{ stroke: "var(--border-strong)" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    formatX(new Date(value as string | number))
                  }
                  indicator="dot"
                />
              }
            />
            {series.map((s, index) => (
              <Area
                key={s.dataKey}
                dataKey={s.dataKey}
                type={curveType}
                fill={`url(#${gradientId}-${s.dataKey})`}
                stroke={s.color || `var(--chart-${index + 1})`}
                strokeWidth={2}
                stackId={stacked ? "a" : undefined}
              />
            ))}
            {showLegend && series.length > 1 && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
          </AreaChart>
        </ChartContainer>
      )}
    </figure>
  );
}

export function UserGrowthChart({
  data,
}: {
  data: { graphData: { timestamp: Date; count: number }[] };
}) {
  const chartData = data.graphData.map((d) => ({
    timestamp: d.timestamp,
    users: d.count,
  }));

  return (
    <GenericAreaChart
      data={chartData}
      series={[
        { dataKey: "users", label: "New users", color: "var(--chart-1)" },
      ]}
      title="User growth"
      description="New registrations over time"
      chartHeight={300}
    />
  );
}
