"use server";
import z from "zod";
import { generateJsonFromDocument } from './api';
import { courseArraySchema, eventArraySchema } from "./schema";



export async function generateEventsByDoc(
  images: (string | ArrayBuffer)[]
): Promise<{
  error: any | null;
  events: z.infer<typeof eventArraySchema>;
  message: string;
}> {

  try {
    const response = await generateJsonFromDocument(
      images,
      "events"
    );
    const events = eventArraySchema.parse(response.object);
    return Promise.resolve({
      error: null,
      events: events,
      message: events.length + " Events generated successfully",
    });
  } catch (error) {
    return Promise.resolve({
      error:
        error instanceof Error
          ? error.message
          : new Error("An unexpected error occurred"),
      events: [],
      message:
        "An error occurred while generating events from the document. Please try again later.",
    });
  }
}

export async function generateCoursesByDoc(
  images: (string | ArrayBuffer)[]
): Promise<{
  error: any | null;
  courses: z.infer<typeof courseArraySchema>;
  message: string;
}> {
  try {
    const response = await generateJsonFromDocument(
      images,
      "courses"
    );
    const courses = courseArraySchema.parse(response.object);
    return Promise.resolve({
      error: null,
      courses: courses,
      message: courses.length + " Courses generated successfully",
    });
  } catch (error) {
    return Promise.resolve({
      error:
        error instanceof Error
          ? error.message
          : new Error("An unexpected error occurred"),
      courses: [],
      message:
        "An error occurred while generating courses from the document. Please try again later.",
    });
  }

}