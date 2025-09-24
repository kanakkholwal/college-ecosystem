// app/attendance/page.tsx
import EmptyArea from "@/components/common/empty-area"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { BookUser } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { getAttendanceRecords } from "~/actions/student.record_personal"
import AttendanceAnalytics from "./attendance-analytics"
import CreateAttendanceRecord from "./create-record"
import AttendanceRecord from "./record"

export const metadata: Metadata = {
  title: "Attendance",
  description: "Manage your attendance records here.",
}

export default async function PersonalAttendanceManager() {
  const attendance_records = await getAttendanceRecords()

  return (
    <div className="relative z-10 w-full max-w-7xl space-y-8 @container/attendance">
      {/* Analytics Section */}
      <AttendanceAnalytics records={attendance_records} />

      {/* Header */}
      <div className="flex w-full items-center justify-between gap-2 rounded-lg border bg-card/80 backdrop-blur-sm p-4 shadow-sm">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Attendance Records
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({attendance_records.length})
          </span>
        </h3>
        <CreateAttendanceRecordButton />
      </div>

      {/* Empty State */}
      {attendance_records.length === 0 && (
        <EmptyArea
          icons={[BookUser]}
          title="No attendance records"
          description="There are no attendance records yet. Create one to get started."
        />
      )}

      {/* Records Grid */}
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {attendance_records.map((record, index) => (
            <AttendanceRecord
              record={record}
              key={record.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </div>
      </Suspense>
    </div>
  )
}

function CreateAttendanceRecordButton() {
  return (
    <ResponsiveDialog
      title="Create Attendance Record"
      description="Add a new attendance record for a subject."
      btnProps={{
        variant: "default_light",
        size: "sm",
        children: "Create Record",
      }}
    >
      <CreateAttendanceRecord />
    </ResponsiveDialog>
  )
}
