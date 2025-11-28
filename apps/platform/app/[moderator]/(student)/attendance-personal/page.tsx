// app/attendance/page.tsx
import EmptyArea from "@/components/common/empty-area"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { BookUser, Plus } from "lucide-react"
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
    <div className="w-full max-w-7xl mx-auto space-y-10 py-6 px-4">

      {/* Analytics Section */}
      <section>
        <AttendanceAnalytics records={attendance_records} />
      </section>

      {/* Main Content Area */}
      <section className="space-y-6">

        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight">Your Subjects</h3>
            <p className="text-sm text-muted-foreground">
              Manage attendance for {attendance_records.length} active courses.
            </p>
          </div>
          <CreateAttendanceRecordButton />
        </div>

        {/* Empty State */}
        {attendance_records.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 bg-muted/30">
            <EmptyArea
              icons={[BookUser]}
              title="No subjects tracked"
              description="Start by adding a subject to track your daily attendance."
            />
          </div>
        )}

        {/* Records Grid */}
        <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">Loading records...</div>}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {attendance_records.map((record, index) => (
              <AttendanceRecord
                record={record}
                key={record.id}
                className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
        </Suspense>
      </section>
    </div>
  )
}

function CreateAttendanceRecordButton() {
  return (
    <ResponsiveDialog
      title="Add New Subject"
      description="Create a tracker for a new course."
      btnProps={{
        variant: "default",
        size: "sm",
        className: "shadow-lg shadow-primary/20",
        children: (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </>
        ),
      }}
    >
      <CreateAttendanceRecord />
    </ResponsiveDialog>
  )
}