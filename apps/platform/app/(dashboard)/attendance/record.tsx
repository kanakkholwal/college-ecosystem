"use client";
import { CircleSlash } from "lucide-react";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import ConditionalRender from "@/components/utils/conditional-render";
import { Label, Pie, PieChart } from "recharts";
import { updateAttendanceRecord } from "src/lib/attendance/personal.actions";
import { AttendanceRecordWithId } from "src/models/attendance-record";
import UpdateAttendanceRecord from "./update-record";

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
interface AttendanceRecordProps {
  record: AttendanceRecordWithId;
  style?: React.CSSProperties;
}
const ATTENDANCE_CRITERIA = 75;

export default function AttendanceRecord({
  record,
  style,
}: AttendanceRecordProps) {
  const totalClasses = record.totalClasses;

  const chartData = [
    {
      name: "Attended",
      value: record.attendance.filter((a) => a.isPresent).length,
      fill: "hsl(var(--chart-primary))",
    },
    {
      name: "Absent",
      value: record.attendance.filter((a) => !a.isPresent).length,
      fill: "hsl(var(--chart-danger))",
    },
  ];
  return (
    <div
      className="flex flex-col p-3 gap-2 rounded-lg border-b border-border hover:bg-white/30 animate-in popup"
      style={style}
    >
      <div className="flex items-center gap-2 w-full justify-between flex-wrap">
        <div className="flex items-start flex-col">
          <h4 className="text-sm tracking-wide font-semibold text-gray-900 dark:text-white">
            {record.subjectName.replaceAll("&amp;", "&")}
          </h4>
          <p className="text-xs text-gray-600">{record.subjectCode}</p>
        </div>
        <div>
          <ConditionalRender condition={totalClasses === 0}>
            <div className="flex flex-col items-center justify-center gap-4">
              <CircleSlash className="h-12 w-12 text-danger" />
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
        </div>
      </div>
      <p>
        Attendance: {record.attendance.filter((a) => a.isPresent).length}/
        {record.totalClasses}
      </p>
      <div className="flex item-baseline w-full gap-2 justify-between">
        <p className="text-sm font-semibold text-slate-700">
          {getAttendanceStatus(record)}
        </p>
        <UpdateAttendanceRecord
          updateAttendanceRecord={updateAttendanceRecord.bind(null, record._id)}
        />
      </div>
    </div>
  );
}

const attendancePercentage = (record: AttendanceRecordWithId) => {
  return (
    (record.attendance.filter((a) => a.isPresent).length /
      record.totalClasses) *
    100
  );
};

const getAttendanceStatus = (record: AttendanceRecordWithId) => {
  const classesAttended = record.attendance.filter((a) => a.isPresent).length;
  const totalClasses = record.totalClasses;
  const requiredPercentage = ATTENDANCE_CRITERIA / 100;

  if (totalClasses === 0) {
    return "Start attending classes to get status";
  }

  const targetClasses = Math.ceil(totalClasses * requiredPercentage);
  const attendanceShortfall = targetClasses - classesAttended;
  const possibleFutureClasses = Math.ceil(
    attendanceShortfall / (1 - requiredPercentage)
  );
  const currentPercentage = attendancePercentage(record);

  if (currentPercentage >= ATTENDANCE_CRITERIA) {
    if (attendanceShortfall <= 0) {
      return `On Track, You can't miss the next class.`;
    } else if (attendanceShortfall === 1) {
      return `On Track, You may leave the next class.`;
    } else {
      return `On Track, You may leave the next ${attendanceShortfall} classes.`;
    }
  } else {
    if (possibleFutureClasses === 1) {
      return "Attend next class to get back on track.";
    } else {
      return `Attend the next ${possibleFutureClasses} classes to get back on track.`;
    }
  }
};
