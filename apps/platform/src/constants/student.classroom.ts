import { z } from "zod";
import { emailSchema } from ".";
import { rollNoSchema } from "./core.departments";

export const classRoomSchema = z.object({
  className: z.string().min(1, { message: "Class name is required" }),
  department: z
    .string()
    .min(1, { message: "Department is required" })
    .default("mix"),
  year: z.string().min(1, { message: "Year is required" }),
  students: z.array(
    z.object({
      name: z.string().min(1, { message: "Student name is required" }),
      rollNo: rollNoSchema.or(
        z.string().min(1, { message: "Roll number is required" })
      ),
      role: z.enum(["student", "cr"]).default("student"),
    })
  ),
  classTeacher: z.object({
    name: z.string().min(1, { message: "Class teacher name is required" }),
    email: emailSchema,
    phoneNumber: z.string().optional(),
  }),
  classRep: z.array(
    z.object({
      name: z.string().min(1, { message: "Class rep name is required" }),
      email: emailSchema,
      phoneNumber: z.string().optional(),
    })
  ),
});

export type rawClassRoomType = z.infer<typeof classRoomSchema>;
