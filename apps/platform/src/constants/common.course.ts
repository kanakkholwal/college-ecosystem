import { z } from "zod";

export const courseSchema = z.object({
    name: z.string().describe("Name of the course"),
    code: z.string().describe("Course code, e.g., CS101"),
    type: z.string().describe("Type of the course, e.g., Core, Elective"),
    credits: z.number().int().describe("Number of credits for the course"),
    department: z.string().describe("Department offering the course"),
    outcomes: z.array(z.string()).describe("Learning outcomes of the course"),

})

export const courseSchemaByOCR = z.object({
    ...courseSchema.shape,
    chapters: z.array(z.object({
        title: z.string().describe("Title of the chapter"),
        topics: z.array(z.string()).describe("Topics covered in the chapter"),
        lectures: z.number().int().describe("Number of lectures for the chapter"),
    })).describe("Array of chapters in the course"),
})