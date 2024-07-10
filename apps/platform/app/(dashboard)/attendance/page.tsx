import EmptyArea from "@/components/common/empty-area";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { BookUser } from "lucide-react";
import { Suspense } from "react";
import { getAttendanceRecords } from "src/lib/attendance/personal.actions";
import CreateAttendanceRecord from "./create-record";
import AttendanceRecord from "./record";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Attendance | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: "Manage your attendance records here.",
};

export default async function PersonalAttendanceManager() {
  const attendance_records = await getAttendanceRecords();
  console.log(attendance_records);

  return (
    <div className="z-10 w-full max-w-7xl relative bg-white/20 backdrop-blur-lg mt-20 lg:mt-5 rounded-lg p-4 @container/attendance">
      <div className="w-full flex justify-between items-center whitespace-nowrap gap-2 mb-10">
        <h3 className="text-xl font-semibold">Announcements</h3>

        <ResponsiveDialog
          title="Create Attendance Record"
          description="Create a new attendance record for a subject."
          btnProps={{
            variant: "default_light",
            size: "sm",
            children: "Create Record",
          }}
        >
          <CreateAttendanceRecord />
        </ResponsiveDialog>
      </div>
      {attendance_records.length === 0 && (
        <EmptyArea
          Icon={BookUser}
          title="No attendance records"
          description="There are no attendance records at the moment."
        />
      )}
      <Suspense fallback={<div>Loading...</div>}>
        {attendance_records.map((record, index) => (
          <AttendanceRecord
            record={record}
            style={{ animationDelay: `${index * 50}ms` }}
            key={index}
          />
        ))}
      </Suspense>
    </div>
  );
}
