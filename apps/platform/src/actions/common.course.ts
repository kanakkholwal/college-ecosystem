"use server";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "~/auth";
import { db } from "~/db/connect";
import {
  booksAndReferences,
  chapters,
  courses,
  previousPapers,
} from "~/db/schema";

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
  course: CourseSelect | null;
  booksAndReferences: BookReferenceSelect[];
  previousPapers: PreviousPaperSelect[];
  chapters: ChapterSelect[];
}> {
  // Fetch course details
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

  const courseId = course.id;

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
    course: course as CourseSelect,
    booksAndReferences: books as BookReferenceSelect[],
    previousPapers: papers as PreviousPaperSelect[],
    chapters: courseChapters as ChapterSelect[],
  };
}
export async function getCourseById(id: string) {
  const course = await db.select().from(courses).where(eq(courses.id, id));
  return (course[0] as CourseSelect) || null;
}

export async function createCourse(data: Omit<CourseInsert, "id" | "createdAt" | "updatedAt">) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session) throw new Error("Unauthorized");
  
  // Authorization check (Admin, Faculty, CR)
  const { role, other_roles } = session.user;
  const isAuthorized = role === "admin" || other_roles.includes("cr") || other_roles.includes("faculty");
  
  if (!isAuthorized) throw new Error("You do not have permission to create courses.");

  // Insert
  const [newCourse] = await db
    .insert(courses)
    .values({
        ...data,
        outcomes: data.outcomes || [], // Ensure array if undefined
    })
    .returning();

  return newCourse as CourseSelect;
}

export async function updateCourseByCr(course: Partial<CourseSelect>) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
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

export async function updateOrInsertChapterForCourseId(
  courseId: string,
  action: "update" | "insert",
  chapterData: Partial<ChapterSelect>,
  chapterId?: string,
) {
  try{
    if (action === "update") {
      if (!chapterId) {
        throw new Error("Chapter id is required for update");
      }
      const updatedChapter = await db
        .update(chapters)
        .set(chapterData)
        .where(
          and(eq(chapters.id, chapterId), eq(chapters.courseId, courseId))
        )
        .returning();
      return updatedChapter[0] as ChapterSelect;
    } else if (action === "insert") {
      const newChapter = await db
        .insert(chapters)
        .values({
          courseId,
          title: chapterData.title || "New Chapter",
          lectures: chapterData.lectures || 0,
          topics: chapterData.topics || [],
        })
        .returning();
      return newChapter[0] as ChapterSelect;
    }
   
  } catch (error) {
    throw new Error("Failed to update chapter: " + (error as Error).message);
  }
}
export async function deleteChapter(chapterId: string, courseId: string) {
  const deletedChapter = await db
    .delete(chapters)
    .where(
      and(eq(chapters.id, chapterId), eq(chapters.courseId, courseId))
    )
    .returning();
  return deletedChapter[0] as ChapterSelect;
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
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
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

