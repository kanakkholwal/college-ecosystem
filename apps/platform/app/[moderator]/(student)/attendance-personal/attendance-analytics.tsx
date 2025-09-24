"use client"

import { NumberTicker } from "@/components/animation/number-ticker"
import { cn } from "@/lib/utils"
import type React from "react"
import type { PersonalAttendanceWithRecords } from "~/db/schema/attendance_record"

interface AttendanceAnalyticsProps {
  records: PersonalAttendanceWithRecords[]
}

const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({ records }) => {
  const totalClasses = records.reduce((acc, record) => acc + record.records.length, 0)
  const presentClasses = records.reduce(
    (acc, record) => acc + record.records.filter((a) => a.isPresent).length,
    0
  )
  const absentClasses = totalClasses - presentClasses
  const attendancePercentage =
    totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : "0.00"

  return (
    <div className="rounded-xl border bg-card p-6 shadow">
      <h4 className="mb-6 text-lg font-semibold tracking-tight text-foreground">
        Attendance Analytics{" "}
        <span className="ml-1 text-sm font-normal text-muted-foreground">
          ({records.length} Subjects)
        </span>
      </h4>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Classes */}
        <div className="rounded-lg border bg-card/60 p-4">
          <h5 className="text-sm font-medium text-muted-foreground">Total Classes</h5>
          <p className="text-2xl font-bold text-foreground">
            <NumberTicker value={totalClasses} />
          </p>
        </div>

        {/* Classes Attended */}
        <div className="rounded-lg border bg-card/60 p-4">
          <h5 className="text-sm font-medium text-muted-foreground">Classes Attended</h5>
          <p className="text-2xl font-bold text-success">
            <NumberTicker value={presentClasses} />
          </p>
        </div>

        {/* Classes Missed */}
        <div className="rounded-lg border bg-card/60 p-4">
          <h5 className="text-sm font-medium text-muted-foreground">Classes Missed</h5>
          <p className="text-2xl font-bold text-destructive">
            <NumberTicker value={absentClasses} />
          </p>
        </div>

        {/* Attendance Percentage */}
        <div className="rounded-lg border bg-card/60 p-4">
          <h5 className="text-sm font-medium text-muted-foreground">Attendance %</h5>
          <p
            className={cn(
              "text-2xl font-bold",
              parseFloat(attendancePercentage) < 50 && "text-destructive",
              parseFloat(attendancePercentage) >= 50 &&
                parseFloat(attendancePercentage) < 75 &&
                "text-warning",
              parseFloat(attendancePercentage) >= 75 && "text-success"
            )}
          >
            <NumberTicker value={parseFloat(attendancePercentage)} suffix="%" />
          </p>
        </div>
      </div>
    </div>
  )
}

export default AttendanceAnalytics
