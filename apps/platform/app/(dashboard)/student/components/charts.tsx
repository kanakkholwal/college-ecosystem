"use client";
import { CircleSlash } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import ConditionalRender from "@/components/utils/conditional-render";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { AttendanceRecordWithId } from "src/models/attendance-record";
import {
  calculateWeeklyTrend,
  formatAttendanceForSubjects,
  getMonthlyAttendanceData,
} from "../libs";

const chartConfig = {
  attended: {
    label: "Attended",
    color: "hsl(var(--chart-success))",
  },
  absent: {
    label: "Absent",
    color: "hsl(var(--chart-danger))",
  },
  total: {
    label: "Total",
    color: "hsl(var(--chart-info))",
  },
} as ChartConfig;

interface Props {
  attendanceRecords: AttendanceRecordWithId[];
}

export function OverallAttendanceChart({ attendanceRecords }: Props) {
  const totalClasses = attendanceRecords.reduce(
    (sum, record) => sum + record.totalClasses,
    0
  );
  const attendedClasses = attendanceRecords.reduce(
    (sum, record) =>
      sum +
      record.attendance.filter((attendance) => attendance.isPresent).length,
    0
  );
  const absentClasses = totalClasses - attendedClasses;

  const chartData = [
    {
      name: "Attended",
      value: attendedClasses,
      fill: "hsl(var(--chart-primary))",
    },
    { name: "Absent", value: absentClasses, fill: "hsl(var(--chart-danger))" },
  ];

  const weeklyTrend = calculateWeeklyTrend(attendanceRecords)?.at(-1);

  return (
    <Card className="flex flex-col flex-auto ml-auto" variant="glass">
       <CardHeader className="items-center pb-0">
        <CardTitle>Overall Attendance - Showing attendance overview</CardTitle>
        <CardDescription>
        Trending {weeklyTrend?.growth! > 0 ? "up" : "down"} by{" "}
          {weeklyTrend?.percentage.toFixed(1) || 0}% this week
          {weeklyTrend?.growth! > 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ConditionalRender condition={totalClasses === 0}>
          <div className="flex flex-col items-center justify-center gap-4">
            <CircleSlash className="h-12 w-12 text-danger mt-20" />
            <div className="text-center text-lg font-medium text-gray-600">
              No attendance records found
            </div>
            <div className="text-muted-foreground text-sm">
              Your attendance records will be displayed here
            </div>
          </div>
        </ConditionalRender>
        <ConditionalRender condition={totalClasses > 0}>
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
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
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalClasses}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total Classes
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </ConditionalRender>
      </CardContent>
    </Card>
  );
}

export function SubWiseAttendanceChart({ attendanceRecords }: Props) {
  const chartData = formatAttendanceForSubjects(attendanceRecords);

  return (
    <Card className="flex flex-col" variant="glass">
      <CardHeader className="items-center pb-0">
        <CardTitle>Bar Chart - Subject Wise Attendance</CardTitle>
        <CardDescription>Attendance for each subject</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ConditionalRender condition={attendanceRecords.length > 0}>
          <ChartContainer
            config={chartConfig}
            className="w-full aspect-video relative z-10"
          >
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="subjectName" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="attendedClasses"
                fill={chartConfig.attended.color}
                radius={4}
              />
              <Bar
                dataKey="totalClasses"
                fill={chartConfig.total.color}
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </ConditionalRender>
        <ConditionalRender condition={attendanceRecords.length === 0}>
          <div className="flex flex-col items-center justify-center gap-4">
            <CircleSlash className="h-12 w-12 text-danger mt-20" />
            <div className="text-center text-lg font-medium text-gray-600">
              No attendance records found
            </div>
          </div>
        </ConditionalRender>
      </CardContent>
    </Card>
  );
}
export function MonthlyAttendanceChart({ attendanceRecords }: Props) {
  const monthlyData = getMonthlyAttendanceData(attendanceRecords);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Line Chart - Monthly Attendance</CardTitle>
        <CardDescription>Attendance Trends Over Time</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="w-full relative z-10">
          <LineChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="attended"
              stroke="#8884d8"
              name="Attended"
            />
            <Line
              type="monotone"
              dataKey="absent"
              stroke="#82ca9d"
              name="Absent"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Monthly attendance trends for the current academic year.
        </div>
      </CardFooter>
    </Card>
  );
}
