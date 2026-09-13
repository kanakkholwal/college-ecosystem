"use server";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/db/connect";
import {
  booksAndReferences,
  chapters,
  courses,
  previousPapers,
} from "~/db/schema";

type CourseSelect = InferSelectModel<typeof courses>;

type BookReferenceSelect = InferSelectModel<typeof booksAndReferences>;
type BookReferenceInsert = InferInsertModel<typeof booksAndReferences>;

type PreviousPaperSelect = InferSelectModel<typeof previousPapers>;
type PreviousPaperInsert = InferInsertModel<typeof previousPapers>;

type ChapterSelect = InferSelectModel<typeof chapters>;

// These links render as hrefs on the public syllabus; block javascript: and data: URLs.
const publicLink = z
  .string()
  .trim()
  .url()
  .refine((v) => /^https?:\/\//i.test(v), "Only http(s) links are allowed");

export async function getCourses(
  query: string,
  currentPage: number,
  filter: { department?: string; type?: string }
) {
  const resultsPerPage = 32;
  const offset = (currentPage - 1) * resultsPerPage;

  const filterConditions = [];
  if (filter.department && filter.department !== "all") {
    filterConditions.push(eq(courses.department, filter.department));
  }
  if (filter.type && filter.type !== "all") {
    filterConditions.push(eq(courses.type, filter.type));
  }

  const queryConditions = or(
    ilike(courses.code, `%${query}%`),
    ilike(courses.name, `%${query}%`)
  );

  const whereClause = filterConditions.length
    ? and(queryConditions, ...filterConditions)
    : queryConditions;

  const [courseList, totalCourses, departments, types] = await Promise.all([
    db
      .select()
      .from(courses)
      .where(whereClause)
      .orderBy(courses.code)
      .offset(offset)
      .limit(resultsPerPage),
    db
      .select({ count: count(courses.id) })
      .from(courses)
      .where(whereClause),
    db.selectDistinct({ department: courses.department }).from(courses),
    db.selectDistinct({ type: courses.type }).from(courses),
  ]);

  return {
    courses: courseList as CourseSelect[],
    totalCount: totalCourses[0].count,
    totalPages: Math.ceil(totalCourses[0].count / resultsPerPage),
    departments: departments.map((d) => d.department),
    types: types.map((t) => t.type),
  };
}

export async function getCourseByCode(code: string): Promise<{
  course: CourseSelect | null;
  booksAndReferences: BookReferenceSelect[];
  previousPapers: PreviousPaperSelect[];
  chapters: ChapterSelect[];
}> {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.code, code))
    .limit(1);

  if (!course) {
    return {
      course: null,
      booksAndReferences: [],
      previousPapers: [],
      chapters: [],
    };
  }

  const [books, papers, courseChapters] = await Promise.all([
    db
      .select()
      .from(booksAndReferences)
      .where(eq(booksAndReferences.courseId, course.id)),
    db
      .select()
      .from(previousPapers)
      .where(eq(previousPapers.courseId, course.id)),
    db.select().from(chapters).where(eq(chapters.courseId, course.id)),
  ]);

  return {
    course: course as CourseSelect,
    booksAndReferences: books as BookReferenceSelect[],
    previousPapers: papers as PreviousPaperSelect[],
    chapters: courseChapters as ChapterSelect[],
  };
}
export async function updateBooksAndRefPublic(
  courseId: string,
  booksRef: Pick<BookReferenceInsert, "name" | "link" | "type">
) {
  const link = publicLink.parse(booksRef.link);
  const updatedBooksRefs = await db
    .insert(booksAndReferences)
    .values([
      {
        courseId,
        name: booksRef.name,
        link,
        type: booksRef.type,
      },
    ])
    .returning();
  return updatedBooksRefs as BookReferenceSelect[];
}

export async function updatePrevPapersPublic(
  courseId: string,
  paper: Pick<PreviousPaperInsert, "year" | "exam" | "link">
) {
  const link = publicLink.parse(paper.link);
  const updatedPapers = await db
    .insert(previousPapers)
    .values([
      {
        courseId,
        year: paper.year,
        exam: paper.exam,
        link,
      },
    ])
    .returning();
  return updatedPapers as PreviousPaperSelect[];
}
