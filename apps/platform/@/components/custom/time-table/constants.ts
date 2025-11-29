import type { RawEvent, RawTimetableType } from "~/constants/common.time-table";

export const daysMap = new Map([
  [0, "Monday"],
  [1, "Tuesday"],
  [2, "Wednesday"],
  [3, "Thursday"],
  [4, "Friday"],
  // [5, "Saturday"],
  // [6, "Sunday"],
]);

export const timeMap = new Map([
  [0, "8:00 AM - 9:00 AM"],
  [1, "9:00 AM - 10:00 AM"],
  [2, "10:00 AM - 11:00 AM"],
  [3, "11:00 AM - 12:00 PM"],
  [4, "12:00 PM - 1:00 PM"],
  [5, "1:00 PM - 2:00 PM"],
  [6, "2:00 PM - 3:00 PM"],
  [7, "3:00 PM - 4:00 PM"],
  [8, "4:00 PM - 5:00 PM"],
  [9, "5:00 PM - 6:00 PM"],
]);

export const rawTimetableData: RawTimetableType = {
  department_code: "",
  sectionName: "",
  year: 1,
  semester: 1,
  schedule: Array.from(daysMap.entries()).map((_, dayIndex) => ({
    day: dayIndex,
    timeSlots: Array.from(timeMap.entries()).map((_, timeSlotIndex) => ({
      startTime: timeSlotIndex,
      endTime: timeSlotIndex + 1,
      events: [] as RawEvent[],
    })),
  })),
  status: "draft",
};
