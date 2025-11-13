"use client"

import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TIME_INTERVALS } from "~/utils/process"
import { MagicCard } from "../animation/magic-card"

// Types
export interface DataPoint {
    timestamp: Date
    [key: string]: Date | number
}

export interface ChartSeries {
    dataKey: string
    label: string
    color?: string
    showInLegend?: boolean
}

export interface GenericAreaChartProps {
    // Data
    data: DataPoint[]
    series: ChartSeries[]

    // Card props
    title?: string
    description?: string
    className?: string

    // Time range filter
    showTimeRangeFilter?: boolean
    timeRangeOptions?: Array<{
        value: string
        label: string
        days: number
    }>
    defaultTimeRange?: string
    onTimeRangeChange?: (value: string) => void

    // Chart configuration
    chartHeight?: number
    showGrid?: boolean
    showXAxis?: boolean
    showYAxis?: boolean
    showLegend?: boolean
    stacked?: boolean
    curveType?: "monotone" | "natural" | "linear" | "step"

    // Formatting
    xAxisFormatter?: (value: Date) => string
    yAxisFormatter?: (value: number) => string
    tooltipFormatter?: (value: number | string, name: string) => string | number

    // Colors
    gradientOpacity?: {
        start: number
        end: number
    }

    // Empty state
    emptyStateMessage?: string
}

export function GenericAreaChart({
    data,
    series,
    title,
    description,
    className = "",
    showTimeRangeFilter = false,
    timeRangeOptions = TIME_INTERVALS ,
    defaultTimeRange = "last_month",
    onTimeRangeChange,
    chartHeight = 250,
    showGrid = true,
    showXAxis = true,
    showYAxis = false,
    showLegend = true,
    stacked = false,
    curveType = "natural",
    xAxisFormatter,
    yAxisFormatter,
    tooltipFormatter,
    gradientOpacity = { start: 0.8, end: 0.1 },
    emptyStateMessage = "No data available",
}: GenericAreaChartProps) {
    const [timeRange, setTimeRange] = React.useState<string>(defaultTimeRange)
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname  = usePathname();
    // Generate chart config from series
    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {}
        series.forEach((s, index) => {
            config[s.dataKey] = {
                label: s.label,
                color: s.color || `var(--chart-${index + 1})`,
            }
        })
        return config
    }, [series])

   
    // Handle time range change
    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value)
        onTimeRangeChange?.(value)
        // Update URL search params
        const params = new URLSearchParams(searchParams.toString())
        params.set("period", value)
        router.replace(`${pathname}?${params.toString()}`)
    }

    // Default formatters
    const defaultXAxisFormatter = (value: Date) => {
        const date = new Date(value)
        if (isNaN(date.getTime())) {  // Added validation
            return String(value)
        }
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        })
    }

    const defaultYAxisFormatter = (value: number) => {
        return value.toLocaleString()
    }

    const defaultTooltipFormatter = (value: number, name: string) => {
        return value.toLocaleString()
    }

    // Transform data for recharts (convert Date to string for dataKey)
    const chartData = React.useMemo(() => {
        return data.map(item => ({
            ...item,
            date: item.timestamp.toISOString(),
        }))
    }, [data])

    // Empty state
    if (!data.length) {
        return ( 
            <MagicCard layerClassName="bg-card"
                className={cn("hover:shadow duration-500 rounded-lg shadow", className)}>
                {(title || description || showTimeRangeFilter) && (
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 @2xl:p-4">
                        {(title || description) && (
                            <div className="grid flex-1 gap-1">
                                {title && <CardTitle className="font-medium text-base">{title}</CardTitle>}
                                {description && <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>}
                            </div>
                        )}
                        {showTimeRangeFilter && (
                            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                                <SelectTrigger
                                    className="w-[160px] rounded-lg sm:ml-auto"
                                    aria-label="Select a time range"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {timeRangeOptions.map(option => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="rounded-lg"
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </CardHeader>
                )}
                <CardContent className="flex items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">{emptyStateMessage}</p>
                </CardContent>
            </MagicCard>
        )
    }

    return (
        <MagicCard layerClassName="bg-card"
            className={cn("hover:shadow duration-500 rounded-lg shadow", className)}>
            {(title || description || showTimeRangeFilter) && (
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 @2xl:p-4">
                    {(title || description) && (
                        <div className="grid flex-1 gap-1">
                            {title && <CardTitle className="font-medium text-base">{title}</CardTitle>}
                            {description && <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>}
                        </div>
                    )}
                    {showTimeRangeFilter && (
                        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                            <SelectTrigger
                                className="w-[160px] rounded-lg sm:ml-auto"
                                aria-label="Select a time range"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {timeRangeOptions.map(option => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="rounded-lg"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardHeader>
            )}
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className={`aspect-auto w-full`}
                    style={{ height: `${chartHeight}px` }}
                >
                    <AreaChart data={chartData}>
                        {/* Gradients */}
                        <defs>
                            {series.map((s, index) => (
                                <linearGradient
                                    key={s.dataKey}
                                    id={`fill${s.dataKey}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={s.color || `hsl(var(--chart-${index + 1}))`}
                                        stopOpacity={gradientOpacity.start}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={s.color || `hsl(var(--chart-${index + 1}))`}
                                        stopOpacity={gradientOpacity.end}
                                    />
                                </linearGradient>
                            ))}
                        </defs>

                        {/* Grid */}
                        {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}

                        {/* X Axis */}
                        {showXAxis && (
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={xAxisFormatter || defaultXAxisFormatter}
                            />
                        )}

                        {/* Y Axis */}
                        {showYAxis && (
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={yAxisFormatter || defaultYAxisFormatter}
                            />
                        )}

                        {/* Tooltip */}
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        const formatter = xAxisFormatter || defaultXAxisFormatter
                                        return formatter(new Date(value))
                                    }}
                                    // formatter={(value: string | number) => {
                                    //     if (typeof value === 'number') {
                                    //         return value.toLocaleString()
                                    //     }
                                    //     return value
                                    // }}
                                    indicator="dot"
                                />
                            }
                        />

                        {/* Areas */}
                        {series.map((s, index) => (
                            <Area
                                key={s.dataKey}
                                dataKey={s.dataKey}
                                type={curveType}
                                fill={`url(#fill${s.dataKey})`}
                                stroke={s.color || `hsl(var(--chart-${index + 1}))`}
                                strokeWidth={2}
                                stackId={stacked ? "a" : undefined}
                            />
                        ))}

                        {/* Legend */}
                        {showLegend && series.length > 1 && (
                            <ChartLegend content={<ChartLegendContent />} />
                        )}
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </MagicCard>
    )
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: User Growth Chart
export function UserGrowthChart({ data }: { data: any }) {
    const chartData = data.graphData.map((d: any) => ({
        timestamp: d.timestamp,
        users: d.count,
    }))

    return (
        <GenericAreaChart
            data={chartData}
            series={[
                { dataKey: "users", label: "New Users", color: "hsl(var(--chart-1))" },
            ]}
            title="User Growth"
            description="New user registrations over time"
            showTimeRangeFilter={false}
            chartHeight={300}
        />
    )
}



// Example 5: Multi-metric Dashboard Chart
// export function MultiMetricChart({ userData, sessionData }: { userData: any; sessionData: any }) {
//     // Combine both datasets
//     const userMap = new Map(
//         userData.graphData.map((d: any) => [d.timestamp.getTime(), d.count])
//     )
//     const sessionMap = new Map(
//         sessionData.graphData.map((d: any) => [d.timestamp.getTime(), d.count])
//     )

//     const allTimestamps = new Set([
//         ...userData.graphData.map((d: any) => d.timestamp.getTime()),
//         ...sessionData.graphData.map((d: any) => d.timestamp.getTime()),
//     ])

//     const chartData = Array.from(allTimestamps)
//         .sort((a, b) => a - b)
//         .map(timestamp => ({
//             timestamp: new Date(timestamp),
//             users: userMap.get(timestamp) || 0,
//             sessions: sessionMap.get(timestamp) || 0,
//         }))

//     return (
//         <GenericAreaChart
//             data={chartData}
//             series={[
//                 { dataKey: "users", label: "New Users", color: "hsl(var(--chart-1))" },
//                 { dataKey: "sessions", label: "Sessions", color: "hsl(var(--chart-2))" },
//             ]}
//             title="Users & Sessions"
//             description="Combined analytics overview"
//             showTimeRangeFilter={true}
//             chartHeight={350}
//             stacked={false}
//             showLegend={true}
//             showYAxis={true}
//         />
//     )
// }