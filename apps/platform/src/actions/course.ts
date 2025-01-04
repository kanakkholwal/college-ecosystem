"use server";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { db } from "src/db/connect";
import {
  booksAndReferences,
  courses,
  previousPapers,
  chapters,
} from "src/db/schema";
import { getSession } from "src/lib/auth-server";

// Infer types for courses
type CourseSelect = InferSelectModel<typeof courses>;
type CourseInsert = InferInsertModel<typeof courses>;

// Infer types for books and references
type BookReferenceSelect = InferSelectModel<typeof booksAndReferences>;
type BookReferenceInsert = InferInsertModel<typeof booksAndReferences>;

// Infer types for previous papers
type PreviousPaperSelect = InferSelectModel<typeof previousPapers>;
type PreviousPaperInsert = InferInsertModel<typeof previousPapers>;

type ChapterSelect = InferSelectModel<typeof chapters>;

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
    totalPages: Math.ceil(totalCourses[0].count / resultsPerPage),
    departments: departments.map((d) => d.department),
    types: types.map((t) => t.type),
  };
}

export async function getCourseByCode(code: string): Promise<{
  course: CourseSelect;
  booksAndReferences: BookReferenceSelect[];
  previousPapers: PreviousPaperSelect[];
  chapters: ChapterSelect[];
}> {
  // Fetch course details
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.code, code))
    .limit(1);

  if (course.length === 0) {
    throw new Error(`Course with code ${code} not found`);
  }

  const courseId = course[0].id;

  // Fetch related books and references
  const books = await db
    .select()
    .from(booksAndReferences)
    .where(eq(booksAndReferences.courseId, courseId));

  // Fetch related previous papers
  const papers = await db
    .select()
    .from(previousPapers)
    .where(eq(previousPapers.courseId, courseId));

  // Fetch related chapters
  const courseChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.courseId, courseId));

  return {
    course: course[0] as CourseSelect,
    booksAndReferences: books as BookReferenceSelect[],
    previousPapers: papers as PreviousPaperSelect[],
    chapters: courseChapters as ChapterSelect[],
  };
}
export async function getCourseById(id: string) {
  const course = await db.select().from(courses).where(eq(courses.id, id));
  return (course[0] as CourseSelect) || null;
}

export async function createCourse(course: CourseInsert) {
  const newCourse = await db.insert(courses).values(course).returning();
  return newCourse[0] as CourseSelect;
}

export async function updateCourseByCr(course: Partial<CourseSelect>) {
  const session = await getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  if (!course.id) {
    throw new Error("Course id is required");
  }
  if (
    !(
      session.user.role === "admin" ||
      session.user.other_roles.includes("cr") ||
      session.user.other_roles.includes("faculty")
    )
  ) {
    throw new Error(
      "User not authorized, only CR, faculty, and admin can update courses"
    );
  }

  const updatedCourse = await db
    .update(courses)
    .set(course)
    .where(eq(courses.id, course.id))
    .returning();
  return updatedCourse[0] as CourseSelect;
}

export async function updateBooksAndRefPublic(
  courseId: string,
  booksRef: Pick<BookReferenceInsert, "name" | "link" | "type">
) {
  const updatedBooksRefs = await db
    .insert(booksAndReferences)
    .values([
      {
        courseId,
        name: booksRef.name,
        link: booksRef.link,
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
  const updatedPapers = await db
    .insert(previousPapers)
    .values([
      {
        courseId,
        year: paper.year,
        exam: paper.exam,
        link: paper.link,
      },
    ])
    .returning();
  return updatedPapers as PreviousPaperSelect[];
}

export async function deleteCourse(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  if (
    !(
      session.user.role === "admin" ||
      session.user.other_roles.includes("cr") ||
      session.user.other_roles.includes("faculty")
    )
  ) {
    throw new Error(
      "User not authorized, only CR, faculty, and admin can delete courses"
    );
  }

  const deletedCourse = await db
    .delete(courses)
    .where(eq(courses.id, id))
    .returning();
  return deletedCourse[0] as CourseSelect;
}
