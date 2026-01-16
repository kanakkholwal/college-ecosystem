"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  TrendingUp,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { PersonalAttendanceWithRecords } from "~/db/schema/attendance_record";

const chartConfig = {
  present: {
    label: "Present",
    color: "var(--chart-1)",
  },
  absent: {
    label: "Absent",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

interface AttendanceDetailsProps {
  record: PersonalAttendanceWithRecords;
}

export function AttendanceDetails({ record }: AttendanceDetailsProps) {
  // Memoize sort to prevent flickering on re-renders
  const sortedHistory = React.useMemo(() => {
    return [...record.records].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [record.records]);

  const totalClasses = record.records.length;
  const presentClasses = record.records.filter((r) => r.isPresent).length;
  const absentClasses = totalClasses - presentClasses;
  const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

  const chartData = React.useMemo(
    () => [
      { browser: "present", visitors: presentClasses, fill: "var(--color-present)" },
      { browser: "absent", visitors: absentClasses, fill: "var(--color-absent)" },
    ],
    [presentClasses, absentClasses]
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* 2. Left Column: Analytics (Sticky on Desktop) */}
      <div className="lg:col-span-4 lg:col-start-1">
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Main Score Card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Attendance Health
            </h3>

            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[220px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="visitors"
                  nameKey="browser"
                  innerRadius={70}
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
                              className="fill-foreground text-4xl font-bold tracking-tighter"
                            >
                              {percentage.toFixed(1)}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-xs uppercase tracking-wider"
                            >
                              Current
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/40 p-4 text-center">
                <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {presentClasses}
                </span>
                <span className="text-xs text-muted-foreground font-medium uppercase">
                  Present
                </span>
              </div>
              <div className="rounded-lg bg-muted/40 p-4 text-center">
                <span className="block text-2xl font-bold text-red-600 dark:text-red-400">
                  {absentClasses}
                </span>
                <span className="text-xs text-muted-foreground font-medium uppercase">
                  Absent
                </span>
              </div>
            </div>
          </div>

          {/* Insight Card */}
          <div
            className={cn(
              "rounded-xl border p-5 shadow-sm",
              percentage >= 75
                ? "bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/10 dark:border-emerald-900/30"
                : "bg-red-50/50 border-red-200/50 dark:bg-red-950/10 dark:border-red-900/30"
            )}
          >
            <div className="flex items-start gap-3">
              {percentage >= 75 ? (
                <TrendingUp className="mt-0.5 size-5 text-emerald-600" />
              ) : (
                <AlertCircle className="mt-0.5 size-5 text-red-600" />
              )}
              <div>
                <h4
                  className={cn(
                    "font-semibold text-sm",
                    percentage >= 75
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-red-700 dark:text-red-400"
                  )}
                >
                  {percentage >= 75 ? "On Track" : "Action Required"}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground text-balance">
                  {percentage >= 75
                    ? "Great job! Maintain this streak to keep your eligibility secure."
                    : "You are below the 75% threshold. You need to attend upcoming classes consecutively to recover."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Right Column: History Timeline */}
      <div className="lg:col-span-8">
        <div className="rounded-xl border bg-card shadow-sm flex flex-col overflow-hidden h-full max-h-[800px]">
          <div className="flex items-center justify-between bg-muted/40 p-6 border-b">
            <div>
              <h2 className="text-lg font-semibold">History Log</h2>
              <p className="text-sm text-muted-foreground">
                Chronological view of all sessions
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              <Clock className="size-3.5" />
              Total: {totalClasses}
            </div>
          </div>

          <ScrollArea className="flex-1 w-full p-6">
            {sortedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CalendarDays className="size-12 text-muted-foreground/20" />
                <h3 className="mt-4 text-sm font-medium">No records found</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-2">
                  When you mark attendance for this subject, history will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="relative border-l-2 border-border/50 ml-3 space-y-8 my-2">
                {sortedHistory.map((history) => (
                  <div key={history.id} className="relative pl-8 group">
                    {/* Timeline Dot */}
                    <div
                      className={cn(
                        "absolute -left-[9px] top-6 size-4 rounded-full border-4 border-background transition-colors",
                        history.isPresent
                          ? "bg-emerald-500 ring-1 ring-emerald-500"
                          : "bg-red-500 ring-1 ring-red-500"
                      )}
                    />

                    {/* Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border bg-muted/10 p-4 transition-all hover:bg-muted/30 hover:shadow-sm hover:border-primary/20">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted border shadow-sm",
                            history.isPresent
                              ? "text-emerald-600 bg-emerald-300/20"
                              : "text-red-600 bg-red-300/20"
                          )}
                        >
                          {history.isPresent ? (
                            <CheckCircle2 className="size-5" />
                          ) : (
                            <XCircle className="size-5" />
                          )}
                        </div>
                        <div>
                          <p
                            className={cn(
                              "font-medium",
                              history.isPresent
                                ? "text-emerald-700 dark:text-emerald-400"
                                : "text-red-700 dark:text-red-400"
                            )}
                          >
                            {history.isPresent ? "Present" : "Absent"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {history.date
                              ? format(new Date(history.date), "EEEE, MMMM do, yyyy")
                              : "Unknown Date"}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono self-start sm:self-center bg-background px-2 py-1 rounded border">
                        {history.date
                          ? format(new Date(history.date), "h:mm a")
                          : "--:--"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}