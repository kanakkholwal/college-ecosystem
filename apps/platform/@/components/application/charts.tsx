"use client";

import type * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Pie,
  PieChart,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartPayloadItem,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { cn } from "@/lib/utils";
import { changeCase } from "~/utils/string";

interface BaseProps<
  TData extends Record<string, number | string>,
  TConfig extends ChartConfig,
> {
  data: TData[];
  config: TConfig;
  dataKey: keyof TData;
  nameKey: keyof TData;
  className?: string;
  tooltipProps?: React.ComponentProps<typeof ChartTooltip>;
  tooltipContentProps?: React.ComponentProps<typeof ChartTooltipContent>;
}
interface ChartBarProps<
  TData extends Record<string, any>,
  TConfig extends ChartConfig,
> extends BaseProps<TData, TConfig> {
  orientation?: "horizontal" | "vertical";
}

interface ChartRadialProps<
  TData extends Record<string, any>,
  TConfig extends ChartConfig,
> extends BaseProps<TData, TConfig> {
  dataKey: keyof TData;
  nameKey: keyof TData;

  textLabel?: string;
  textValue: string | number;
}

export function ChartBar<
  TData extends Record<string, any>,
  TConfig extends ChartConfig,
>({
  data,
  config,
  dataKey,
  nameKey,
  orientation = "horizontal",
  className = "mx-auto aspect-square max-h-[250px]",
  tooltipProps,
  tooltipContentProps,
}: ChartBarProps<TData, TConfig>) {
  return (
    <ErrorBoundaryWithSuspense
      fallback={
        <div
          className={cn(
            "flex h-full w-full items-center justify-center",
            className
          )}
        >
          <p className="text-body text-destructive">
            Chart couldn't load. Refresh to try again.
          </p>
        </div>
      }
      loadingFallback={
        <div
          className={cn(
            "flex h-full w-full items-center justify-center",
            className
          )}
        >
          <p className="text-body text-muted-foreground" role="status">
            Loading chart
          </p>
        </div>
      }
    >
      <ChartContainer
        config={config}
        className={cn("mx-auto w-full max-h-[250px]", className)}
      >
        {orientation === "vertical" ? (
          <BarChart
            accessibilityLayer
            data={data.map((item, idx) => ({
              ...item,
              fill: item?.fill || `var(--chart-${idx + 1})`,
            }))}
            layout="vertical"
            margin={{
              right: 5,
            }}
            compact={true}
          >
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <YAxis
              dataKey={nameKey.toString()}
              type="category"
              tickLine={false}
              tickMargin={5}
              axisLine={false}
              tickFormatter={(value) => changeCase(value, "title")}
            />
            <XAxis dataKey={dataKey.toString()} type="number" hide />
            <ChartTooltip
              cursor={false}
              {...tooltipProps}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  nameKey={dataKey.toString()}
                  labelKey={nameKey.toString()}
                  {...tooltipContentProps}
                />
              }
            />
            <Bar dataKey={dataKey.toString()} fill="var(--chart-1)" radius={4}>
              <LabelList
                dataKey={dataKey.toString()}
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        ) : (
          <BarChart
            accessibilityLayer
            data={data.map((item, idx) => ({
              ...item,
              fill: item?.fill || `var(--chart-${idx + 1})`,
            }))}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey={nameKey.toString()}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => changeCase(value, "title")}
            />
            <ChartTooltip
              cursor={true}
              {...tooltipProps}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  nameKey={dataKey.toString()}
                  labelKey={nameKey.toString()}
                  {...tooltipContentProps}
                />
              }
            />
            <Bar dataKey={dataKey.toString()} fill="var(--primary)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        )}
      </ChartContainer>
    </ErrorBoundaryWithSuspense>
  );
}

export function ChartRadialStacked<
  TData extends Record<string, any>,
  TConfig extends ChartConfig,
>({
  data,
  config,
  dataKey,
  nameKey,
  className = "mx-auto aspect-square max-h-[250px]",
  textLabel = "Total",
  textValue = "0000",
}: ChartRadialProps<TData, TConfig>) {
  return (
    <ErrorBoundaryWithSuspense
      fallback={
        <div
          className={cn(
            "flex h-full w-full items-center justify-center",
            className
          )}
        >
          <p className="text-body text-destructive">
            Chart couldn't load. Refresh to try again.
          </p>
        </div>
      }
      loadingFallback={
        <div
          className={cn(
            "flex h-full w-full items-center justify-center",
            className
          )}
        >
          <p className="text-body text-muted-foreground" role="status">
            Loading chart
          </p>
        </div>
      }
    >
      <ChartContainer
        config={config}
        className={cn("mx-auto aspect-square max-h-[250px]", className)}
      >
        <RadialBarChart
          data={data.map((item, idx) => ({
            ...item,
            fill: item?.fill || `var(--chart-${idx + 1})`,
          }))}
          endAngle={180}
          innerRadius={80}
          outerRadius={130}
        >
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="dot"
                nameKey={nameKey.toString()}
                labelKey={dataKey.toString()}
              />
            }
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 16}
                        className="fill-foreground text-heading-sm font-medium"
                      >
                        {textValue}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 4}
                        className="fill-muted-foreground"
                      >
                        {textLabel}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
          <RadialBar
            dataKey={dataKey.toString()}
            stackId="a"
            cornerRadius={5}
            fill="var(--chart-1)"
            className="stroke-2"
          />
        </RadialBarChart>
      </ChartContainer>
    </ErrorBoundaryWithSuspense>
  );
}

interface PieBaseProps<
  TData extends Record<string, any>,
  TConfig extends ChartConfig,
> extends BaseProps<TData, TConfig> {
  pieClassName?: string;
  showLabelList?: boolean;
  showLegend?: boolean;
  /** Inner radius; above 0 draws a donut. */
  innerRadius?: number;
  strokeWidth?: number;
}

interface PieDonutTextProps<
  TData extends Record<string, any>,
  TConfig extends ChartConfig,
> extends BaseProps<TData, TConfig>,
    PieBaseProps<TData, TConfig> {
  textLabel?: string;
  textValue: string | number;
}

export function ChartPieDonutText<
  TData extends Record<string, any>,
  TConfig extends ChartConfig,
>({
  data,
  config,
  dataKey,
  nameKey,
  textLabel = "Total",
  textValue = "000",
  innerRadius = 60,
  strokeWidth = 5,
  className = "mx-auto aspect-square max-h-[250px]",
  tooltipProps,
  tooltipContentProps,
}: PieDonutTextProps<TData, TConfig>) {
  return (
    <ChartContainer config={config} className={className}>
      <PieChart>
        <ChartTooltip
          cursor={false}
          {...tooltipProps}
          content={
            <ChartTooltipContent
              indicator="dot"
              nameKey={nameKey.toString()}
              labelKey={nameKey.toString()}
              {...tooltipContentProps}
            />
          }
        />
        <Pie
          data={data.map((item, idx) => ({
            ...item,
            fill: item?.fill || `var(--chart-${idx + 1})`,
          }))}
          dataKey={dataKey.toString()}
          nameKey={nameKey.toString()}
          innerRadius={innerRadius}
          strokeWidth={strokeWidth}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-heading font-medium"
                    >
                      {textValue}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      {textLabel}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

export function ChartPie<
  TData extends Record<string, any>,
  TConfig extends ChartConfig,
>({
  data,
  config,
  dataKey,
  nameKey,
  innerRadius = 60,
  strokeWidth = 5,
  className = "mx-auto aspect-square max-h-[250px]",
  showLabelList = true,
  tooltipProps,
  tooltipContentProps,
  showLegend = true,
  pieClassName,
}: PieBaseProps<TData, TConfig>) {
  return (
    <ChartContainer
      config={config}
      className={cn("[&_.recharts-text]:fill-background", className)}
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          {...tooltipProps}
          content={
            <ChartTooltipContent
              indicator="dot"
              nameKey={nameKey.toString()}
              labelKey={nameKey.toString()}
              {...tooltipContentProps}
            />
          }
        />
        <Pie
          data={data.map((item, idx) => ({
            ...item,
            fill: item?.fill || `var(--chart-${idx + 1})`,
          }))}
          dataKey={dataKey.toString()}
          nameKey={nameKey.toString()}
          innerRadius={innerRadius}
          strokeWidth={strokeWidth}
          className={cn(pieClassName)}
        >
          {showLabelList && (
            <LabelList
              dataKey={dataKey.toString()}
              className="fill-background"
              stroke="none"
              fontSize={12}
              formatter={(label: React.ReactNode) => {
                const key = label as keyof typeof config;
                const value = config[key]?.label;
                return typeof value === "string" || typeof value === "number"
                  ? value
                  : String(label);
              }}
            />
          )}
        </Pie>
        {showLegend && (
          <ChartLegend
            content={({ payload }) => (
              <ChartLegendContent
                nameKey={nameKey.toString()}
                payload={payload as unknown as ChartPayloadItem[]}
                className="-translate-y-2 flex-wrap gap-2 basis-4/5 lg:*:basis-1/4 *:justify-center"
              />
            )}
          />
        )}
      </PieChart>
    </ChartContainer>
  );
}
export function RoundedPieChart<
  TData extends Record<string, any>,
  TConfig extends ChartConfig,
>({
  data,
  config,
  dataKey,
  nameKey,
  innerRadius = 60,
  strokeWidth = 5,
  className = "mx-auto aspect-square max-h-[250px]",
  showLabelList = true,
  tooltipProps,
  tooltipContentProps,
  showLegend = false,
  pieClassName,
}: PieBaseProps<TData, TConfig>) {
  return (
    <ChartContainer config={config} className={className}>
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey={nameKey.toString()}
              hideLabel
              {...tooltipContentProps}
            />
          }
          {...tooltipProps}
        />
        <Pie
          data={data}
          dataKey={dataKey.toString()}
          nameKey={nameKey.toString()}
          innerRadius={innerRadius}
          outerRadius={90}
          strokeWidth={strokeWidth}
          cornerRadius={8}
          paddingAngle={4}
          className={cn(pieClassName)}
        >
          {showLabelList && (
            <LabelList
              dataKey={dataKey.toString()}
              className="fill-background"
              stroke="none"
              fontSize={12}
              fontWeight={500}
              fill="currentColor"
              formatter={(value: React.ReactNode) => String(value)}
            />
          )}
        </Pie>
        {showLegend && (
          <ChartLegend
            content={({ payload }) => (
              <ChartLegendContent
                nameKey={nameKey.toString()}
                payload={payload as unknown as ChartPayloadItem[]}
                className="-translate-y-2 flex-wrap gap-2 basis-4/5 lg:*:basis-1/4 *:justify-center"
              />
            )}
          />
        )}
      </PieChart>
    </ChartContainer>
  );
}
