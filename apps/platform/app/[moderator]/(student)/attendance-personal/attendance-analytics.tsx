"use client"

import { NumberTicker } from "@/components/animation/number-ticker"
import { cn } from "@/lib/utils"
import { Calculator, CheckCircle2, TrendingUp, XCircle } from "lucide-react"
import type { PersonalAttendanceWithRecords } from "~/db/schema/attendance_record"

interface AttendanceAnalyticsProps {
  records: PersonalAttendanceWithRecords[]
}

export default function AttendanceAnalytics({ records }: AttendanceAnalyticsProps) {
  const totalClasses = records.reduce((acc, record) => acc + record.records.length, 0)
  const presentClasses = records.reduce(
    (acc, record) => acc + record.records.filter((a) => a.isPresent).length,
    0
  )
  const absentClasses = totalClasses - presentClasses
  const attendancePercentage =
    totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(1) : "0.0"

  const percentageValue = parseFloat(attendancePercentage)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:gap-8">
      {/* Main Health Stat */}
      <div className="col-span-1 md:col-span-2 rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <TrendingUp className="w-24 h-24" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Attendance</h4>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={cn(
              "text-5xl font-extrabold tracking-tighter",
              percentageValue >= 75 ? "text-primary" :
                percentageValue >= 60 ? "text-amber-500" : "text-red-500"
            )}>
              <NumberTicker value={percentageValue} />%
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-1000 ease-out",
                percentageValue >= 75 ? "bg-primary" :
                  percentageValue >= 60 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${percentageValue}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Target: 75% across {records.length} subjects
          </p>
        </div>
      </div>

      {/* Breakdown Stats */}
      <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
        <StatBox
          label="Classes Attended"
          value={presentClasses}
          Icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-500/10"
        />
        <StatBox
          label="Classes Missed"
          value={absentClasses}
          Icon={XCircle}
          color="text-red-600"
          bg="bg-red-500/10"
        />
        <StatBox
          label="Total Sessions"
          value={totalClasses}
          Icon={Calculator}
          color="text-blue-600"
          bg="bg-blue-500/10"
          className="col-span-2"
        />
      </div>
    </div>
  )
}

interface StatBoxProps {
  label: string
  value: number
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color: string
  bg: string
  className?: string
}
function StatBox({ label, value, Icon, color, bg, className }: StatBoxProps) {
  return (
    <div className={cn("flex flex-col justify-center rounded-xl border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-md", bg, color)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <span className="text-2xl font-bold tracking-tight">
        <NumberTicker value={value} />
      </span>
    </div>
  )
}

