import { z } from "zod";

const courseSchema = z.object({
  name: z.string(),
  code: z.string(),
  cgpi: z.number(),

  grade: z.string(),
  credits: z.number(),
  sub_points: z.number(),
});

const semesterSchema = z.object({
  sgpi: z.number(),
  cgpi: z.number(),
  courses: z.array(courseSchema),
  semester: z.string(),
  sgpi_total: z.number(),
  cgpi_total: z.number(),
});


export const rawResultSchema = z.object({
  name: z.string(),
  rollNo: z.string(),
  branch: z.string(),
  batch: z.number(),
  programme: z.string(),
  gender: z.enum(["male", "female", "not_specified"]).nullable(),
  semesters: z.array(semesterSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type RawResultType = z.infer<typeof rawResultSchema>;

export const freshersDataSchema = z.array(
  z.object({
    name: z.string(),
    rollNo: z.string(),
    gender: z.enum(["male", "female", "not_specified"]),
  })
);

export const rollNoSchema = z
  .string()
  .regex(/^\d{2}[a-z]{3}\d{3}$/i)
  .refine(
    (rollNo) => {
      const numericPart = Number.parseInt(rollNo.slice(-3));
      return numericPart >= 1 && numericPart <= 999;
    },
    {
      message: "Invalid roll number",
    }
  );

export type Course = {
  name: string;
  code: string;
  cgpi: number;
};
export type Semester = {
  sgpi: number;
  cgpi: number;
  courses: Course[];
  semester: number;
  sgpi_total: number;
  cgpi_total: number;
};
export type ResultType = {
  name: string;
  rollNo: string;
  branch: string;
  batch: number;
  programme: string;
  semesters: Semester[];
  createdAt?: Date;
  updatedAt?: Date;
  gender: "male" | "female" | "not_specified";
};
