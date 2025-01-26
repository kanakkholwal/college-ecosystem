import { cn } from "@/lib/utils";
import type React from "react";
import type { PersonalAttendanceWithRecords } from "~/db/schema/attendance_record";

interface AttendanceAnalyticsProps {
  records: PersonalAttendanceWithRecords[];
}

const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({
  records,
}) => {
  const totalClasses = records.reduce(
    (acc, record) => acc + record.records.length,
    0
  );
  const presentClasses = records.reduce((acc, record) => {
    return acc + record.records.filter((a) => a.isPresent).length;
  }, 0);
  const absentClasses = totalClasses - presentClasses;
  const attendancePercentage =
    totalClasses > 0
      ? ((presentClasses / totalClasses) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="p-4 rounded-md shadow-xs">
      <h4 className="text-lg font-medium mb-4">
        Attendance Analytics ({records.length} Subjects)
      </h4>
      <div className="grid grid-cols-1 @sm/attendance:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-md shadow-sm">
          <h5 className="text-sm font-medium">Total Classes</h5>
          <p className="text-xl font-semibold">{totalClasses}</p>
        </div>
        <div className="p-4 bg-white rounded-md shadow-sm">
          <h5 className="text-sm font-medium">Classes Attended</h5>
          <p className="text-xl font-semibold">{presentClasses}</p>
        </div>
        <div className="p-4 bg-white rounded-md shadow-sm">
          <h5 className="text-sm font-medium">Classes Missed</h5>
          <p className="text-xl font-semibold">{absentClasses}</p>
        </div>
        <div className="p-4 bg-white rounded-md shadow-sm">
          <h5 className="text-sm font-medium whitespace-nowrap">
            Attendance Percentage
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
    </div>
  );
};

export default AttendanceAnalytics;
