import { z } from "zod";

/** Minimum attendance in percent. No department rule is stored, so 75% is the stated default. */
export const ATTENDANCE_THRESHOLD = 75;

export const attendanceSubjectSchema = z.object({
  subjectCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2,4}-?\d{3}[A-Z]?$/, {
      message: "Use the code from your timetable, like CS-301.",
    }),
  subjectName: z
    .string()
    .trim()
    .min(3, { message: "Subject name needs at least 3 characters." })
    .max(120, { message: "Keep the subject name under 120 characters." }),
});

export type AttendanceSubjectInput = z.input<typeof attendanceSubjectSchema>;
