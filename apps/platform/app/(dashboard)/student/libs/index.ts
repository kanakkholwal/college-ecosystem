import { AttendanceRecordWithId } from "src/models/attendance-record";

interface WeeklyTrend {
  weekStart: Date;
  percentage: number;
  growth: -1 | 0 | 1;
}

export function calculateWeeklyTrend(
  attendanceRecords: AttendanceRecordWithId[]
): WeeklyTrend[] {
  // Flatten all attendance records into a single array
  const allAttendance = attendanceRecords.flatMap((record) =>
    record.attendance.map((a) => ({
      date: new Date(a.date),
      isPresent: a.isPresent,
    }))
  );

  // Sort attendance by date
  allAttendance.sort((a, b) => a.date.getTime() - b.date.getTime());

  const weeklyStats: {
    [weekStart: string]: { present: number; total: number };
  } = {};

  // Group attendance by week
  allAttendance.forEach(({ date, isPresent }) => {
    const weekStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - date.getDay()
    );
    const weekKey = weekStart.toISOString();

    if (!weeklyStats[weekKey]) {
      weeklyStats[weekKey] = { present: 0, total: 0 };
    }

    weeklyStats[weekKey].total++;
    if (isPresent) {
      weeklyStats[weekKey].present++;
    }
  });

  // Calculate weekly percentages and growth
  const weeklyTrend: WeeklyTrend[] = Object.entries(weeklyStats).map(
    ([weekStart, stats], index, array) => {
      const percentage = (stats.present / stats.total) * 100;
      let growth: -1 | 0 | 1 = 0;

      if (index > 0) {
        const prevWeek = array[index - 1][1];
        const prevPercentage = (prevWeek.present / prevWeek.total) * 100;
        growth =
          percentage > prevPercentage
            ? 1
            : percentage < prevPercentage
              ? -1
              : 0;
      }

      return {
        weekStart: new Date(weekStart),
        percentage,
        growth,
      };
    }
  );

  return weeklyTrend;
}

interface SubjectAttendance {
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
}

export function formatAttendanceForSubjects(
  attendanceRecords: AttendanceRecordWithId[]
): SubjectAttendance[] {
  return attendanceRecords.map((record) => {
    const attendedClasses = record.attendance.filter((a) => a.isPresent).length;
    return {
      subjectName: record.subjectName,
      totalClasses: record.totalClasses,
      attendedClasses: attendedClasses,
    };
  });
}

export const getMonthlyAttendanceData = (
  attendanceRecords: AttendanceRecordWithId[]
) => {
  const monthlyData: {
    [key: string]: { month: string; attended: number; absent: number };
  } = {};

  attendanceRecords.forEach((record) => {
    record.attendance.forEach(({ date, isPresent }) => {
      const month = new Date(date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!monthlyData[month]) {
        monthlyData[month] = { month, attended: 0, absent: 0 };
      }

      if (isPresent) {
        monthlyData[month].attended += 1;
      } else {
        monthlyData[month].absent += 1;
      }
    });
  });

  return Object.values(monthlyData);
};

export function getSafeAttendance(attendanceRecords: AttendanceRecordWithId[]) {
  const distinctData = attendanceRecords
    .map((record) => {
      const attendedClasses = record.attendance.filter(
        (a) => a.isPresent
      ).length;
      return {
        subject: record.subjectName,
        totalClasses: record.totalClasses,
        attendedClasses: attendedClasses,
      };
    })
    .filter((data) => {
      return data.attendedClasses / data.totalClasses < 0.75;
    });
  if (distinctData.length === 0) {
    return {
      className: "text-green-500 bg-green-500/10",
      message: "You are doing great! Keep it up.",
    };
  } else if (distinctData.length === 1) {
    return {
      className: "text-orange-500 bg-orange-500/10",
      message: `You are missing classes for ${distinctData[0].subject}.`,
    };
  } else {
    return {
      className: "text-red-500 bg-red-500/10",
      message: `You are missing classes for ${distinctData.length} subjects.`,
    };
  }
}
