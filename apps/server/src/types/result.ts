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

const rawResultSchema = z.object({
  name: z.string(),
  rollNo: z.string(),
  branch: z.string(),
  batch: z.number(),
  programme: z.string(),
  semesters: z.array(semesterSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  gender: z.enum(["male", "female", "not_specified"]),
});

export type rawResultType = z.infer<typeof rawResultSchema>;

export { courseSchema, rawResultSchema, semesterSchema };

