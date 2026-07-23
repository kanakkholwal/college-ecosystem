import mongoose from "mongoose";
import { db } from "src/db/connect";
import {
  booksAndReferences,
  chapters,
  courses,
  previousPapers,
} from "src/db/schema";
import dbConnect from "src/lib/dbConnect";

type CourseMongo = {
  name: string;
  code: string;
  type: string;
  credits: number;
  department: string;
  outcomes?: string[];
  chapters: { title: string; topics?: string[]; lectures?: number | null }[];
  books_and_references: { name: string; link: string; type: string }[];
  prev_papers: { year: number; exam: string; link: string }[];
};

export async function mongoToPgDatabase(
  ENV: "production" | "testing" = "production"
) {
  try {
    const time = new Date();
    await dbConnect(ENV);

    // Fetch courses from MongoDB
    const coursesFromMongo = await mongoose
      .model("Course")
      .find()
      .lean<CourseMongo[]>();

    // Start a transaction
    await db.transaction(async (trx) => {
      for (const course of coursesFromMongo) {
        // Insert course into PostgreSQL
        const [courseId] = await trx
          .insert(courses)
          .values({
            name: course.name,
            code: course.code,
            type: course.type,
            credits: course.credits,
            department: course.department,
            outcomes: course.outcomes || [],
          })
          .returning({ id: courses.id });

        // Insert chapters
        for (const chapter of course.chapters) {
          await trx.insert(chapters).values({
            title: chapter.title,
            topics: chapter.topics || [],
            lectures: chapter.lectures || null,
            courseId: courseId.id,
          });
        }

        // Insert books and references
        for (const book of course.books_and_references) {
          await trx.insert(booksAndReferences).values({
            name: book.name,
            link: book.link,
            type: book.type,
            courseId: courseId.id,
          });
        }

        // Insert previous papers
        for (const paper of course.prev_papers) {
          await trx.insert(previousPapers).values({
            year: paper.year,
            exam: paper.exam,
            link: paper.link,
            courseId: courseId.id,
          });
        }
      }
    });

    console.log("Data migration completed successfully.");
    process.exit(1);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(0);
  } finally {
    console.log("Process done!");
  }
}

mongoToPgDatabase();
