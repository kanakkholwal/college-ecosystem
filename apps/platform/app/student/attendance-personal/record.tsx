"use client";

import { CircleSlash } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { cn } from "@/lib/utils";
import { ChartBar } from "lucide-react";
import type { ViewBox } from "recharts/types/util/types";
import { updateAttendanceRecord } from "~/actions/record.personal";
import type { PersonalAttendanceWithRecords } from "~/db/schema/attendance_record";
import UpdateAttendanceRecord from "./update-record";

const ATTENDANCE_CRITERIA = 75;

const chartConfig: ChartConfig = {
  attended: {
    label: "Attended",
    color: "hsl(var(--chart-success))",
  },
  absent: {
    label: "Absent",
    color: "hsl(var(--chart-danger))",
  },
};

interface AttendanceRecordProps {
  record: PersonalAttendanceWithRecords;
  style?: React.CSSProperties;
  className?: string;
}

export default function AttendanceRecord({
  record,
  className,
  style,
}: AttendanceRecordProps) {
  const totalClasses = record.records.length;
  const presentClasses = record.records.filter((a) => a.isPresent).length;
  const absentClasses = totalClasses - presentClasses;

  const chartData = [
    {
      name: "Attended",
      value: presentClasses,
      fill: chartConfig.attended.color,
    },
    { name: "Absent", value: absentClasses, fill: chartConfig.absent.color },
  ];

  const attendancePercentage =
    totalClasses > 0
      ? calculateAttendancePercentage(record).toFixed(2)
      : "0.00";
  const attendanceStatus = getAttendanceStatus(record);

  return (
    <div
      className={cn(
        "flex flex-wrap p-4 gap-4 rounded-lg border hover:border/30 transition-shadow shadow-xs",
        className
      )}
      style={style}
    >
      {/* Header */}
      <div className="grid justify-between items-start mr-auto">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {record.subjectName.replaceAll("&amp;", "&")}
          </h4>
          <p className="text-xs text-gray-600">{record.subjectCode}</p>
        </div>

        {/* Status */}
        <div className="text-sm">
          <p className="font-medium">
            Attendance: {presentClasses}/{totalClasses} ({attendancePercentage}
            %)
          </p>
          <p className="text-sm text-gray-700">{attendanceStatus}</p>
          <UpdateAttendanceRecord
            updateAttendanceRecord={updateAttendanceRecord.bind(
              null,
              record.id
            )}
          >
            <ResponsiveDialog
              title={`Attendance Analytics for ${record.subjectName}`}
              description="View detailed analytics for your attendance record."
              btnProps={{
                variant: "default_light",
                size: "icon_sm",
                children: <ChartBar />,
              }}
            >
              <div className="grid grid-cols-1 @xs/dialog:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md shadow-sm">
                  <h5 className="text-sm font-medium">Total Classes</h5>
                  <p className="text-xl font-semibold">{totalClasses}</p>
                </div>
                <div className="p-4 border rounded-md shadow-sm">
                  <h5 className="text-sm font-medium">Classes Attended</h5>
                  <p className="text-xl font-semibold">{presentClasses}</p>
                </div>
                <div className="p-4 border rounded-md shadow-sm">
                  <h5 className="text-sm font-medium">Classes Missed</h5>
                  <p className="text-xl font-semibold">{absentClasses}</p>
                </div>
                <div className="p-4 border rounded-md shadow-sm">
                  <h5 className="text-sm font-medium whitespace-nowrap">
                    Attendance
                  </h5>
                  <p
                    className={cn(
                      "text-xl font-semibold",
                      Number(attendancePercentage) < 75
                        ? Number(attendancePercentage) < 50
                          ? "text-red-500"
                          : "text-yellow-500"
                        : "text-green-500"
                    )}
                  >
                    {attendancePercentage}%
                  </p>
                </div>
              </div>
            </ResponsiveDialog>
          </UpdateAttendanceRecord>
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-center flex-1">
        {totalClasses > 0 && (
          <ChartContainer config={chartConfig} className="w-32 h-32 mx-auto">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={60}
                strokeWidth={5}
              >
                <Label
                  position="center"
                  content={({ viewBox }) =>
                    viewBox && renderPieLabel(viewBox, totalClasses)
                  }
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
        {/* Empty State */}
        {totalClasses === 0 && (
          <div className="flex flex-col items-center text-center text-gray-600 flex-1 my-auto">
            <CircleSlash className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium">No attendance records found</p>
            <p className="text-xs">Add your first record to start tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function calculateAttendancePercentage(
  record: PersonalAttendanceWithRecords
): number {
  const totalClasses = record.records.length;
  if (totalClasses === 0) return 0;

  const attendedClasses = record.records.filter((a) => a.isPresent).length;
  return (attendedClasses / totalClasses) * 100;
}

function getAttendanceStatus(record: PersonalAttendanceWithRecords): string {
  const totalClasses = record.records.length;
  const attendedClasses = record.records.filter((a) => a.isPresent).length;

  if (totalClasses === 0) {
    return "Start attending classes to get status.";
  }

  const requiredClasses = Math.ceil(totalClasses * (ATTENDANCE_CRITERIA / 100));
  const shortfall = requiredClasses - attendedClasses;

  if (shortfall <= 0) {
    return "On track! Maintain your current attendance.";
  }

  const neededClasses = Math.ceil(shortfall / (1 - ATTENDANCE_CRITERIA / 100));
  return `Attend the next ${neededClasses} classes to get back on track.`;
}

function renderPieLabel(
  viewBox: ViewBox,
  totalClasses: number
): React.ReactNode {
  const { cx, cy } = viewBox as { cx: number; cy: number };
  if (!cx || !cy) return null;
  return (
    <>
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-lg font-semibold"
      >
        {totalClasses}
      </text>
      <text
        x={cx}
        y={cy + 20}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs text-gray-500"
      >
        Total Classes
      </text>
    </>
  );
}
