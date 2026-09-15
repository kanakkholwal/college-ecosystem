"use server";

import { ROLES_ENUMS } from "~/constants";
import { and, eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "~/auth/server";
import { db } from "~/db/connect";
import {
  booksAndReferences,
  chapters,
  courses,
  previousPapers,
} from "~/db/schema";
import { canEditCourses } from "../access";
import {
  type CourseFormValues,
  courseFormSchema,
  splitTopics,
} from "./forms/schema";

export type SaveCourseResult =
  | { ok: true; code: string }
  | { ok: false; error: string; field?: keyof CourseFormValues };

const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown) {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === UNIQUE_VIOLATION || e?.cause?.code === UNIQUE_VIOLATION;
}

function revalidateCourse(code: string) {
  revalidatePath("/syllabus");
  revalidatePath(`/syllabus/${code}`);
  revalidatePath("/[moderator]/courses", "page");
}

/** Creates the course, or replaces it and its units and references when `courseId` is set. */
export async function saveCourse(
  values: CourseFormValues,
  courseId?: string
): Promise<SaveCourseResult> {
  const session = await getSession();
  if (!canEditCourses(session?.user)) {
    return {
      ok: false,
      error: "Only admins, faculty and CRs can edit courses",
    };
  }

  const parsed = courseFormSchema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue.message,
      field: issue.path[0] as keyof CourseFormValues,
    };
  }
  const data = parsed.data;
  const courseRow = {
    name: data.name,
    code: data.code,
    type: data.type,
    credits: data.credits,
    department: data.department,
    outcomes: data.outcomes.map((o) => o.value),
  };

  try {
    const previousCode = await db.transaction(async (tx) => {
      let id = courseId;
      let oldCode: string | null = null;

      if (id) {
        const [existing] = await tx
          .select({ code: courses.code })
          .from(courses)
          .where(eq(courses.id, id));
        if (!existing) throw new Error("NOT_FOUND");
        oldCode = existing.code;
        await tx
          .update(courses)
          .set({ ...courseRow, updatedAt: new Date() })
          .where(eq(courses.id, id));
      } else {
        const [created] = await tx
          .insert(courses)
          .values(courseRow)
          .returning({ id: courses.id });
        id = created.id;
      }
      const cid = id as string;

      // chapters has no position column, so units are rewritten in the order shown.
      await tx.delete(chapters).where(eq(chapters.courseId, cid));
      for (const chapter of data.chapters) {
        await tx.insert(chapters).values({
          courseId: cid,
          title: chapter.title,
          lectures: chapter.lectures,
          topics: splitTopics(chapter.topics),
        });
      }

      const keptBooks = data.books.flatMap((b) => (b.id ? [b.id] : []));
      await tx
        .delete(booksAndReferences)
        .where(
          keptBooks.length
            ? and(
                eq(booksAndReferences.courseId, cid),
                notInArray(booksAndReferences.id, keptBooks)
              )
            : eq(booksAndReferences.courseId, cid)
        );
      for (const { id: bookId, ...book } of data.books) {
        if (bookId) {
          await tx
            .update(booksAndReferences)
            .set(book)
            .where(
              and(
                eq(booksAndReferences.id, bookId),
                eq(booksAndReferences.courseId, cid)
              )
            );
        } else {
          await tx
            .insert(booksAndReferences)
            .values({ ...book, courseId: cid });
        }
      }

      const keptPapers = data.papers.flatMap((p) => (p.id ? [p.id] : []));
      await tx
        .delete(previousPapers)
        .where(
          keptPapers.length
            ? and(
                eq(previousPapers.courseId, cid),
                notInArray(previousPapers.id, keptPapers)
              )
            : eq(previousPapers.courseId, cid)
        );
      for (const { id: paperId, ...paper } of data.papers) {
        if (paperId) {
          await tx
            .update(previousPapers)
            .set(paper)
            .where(
              and(
                eq(previousPapers.id, paperId),
                eq(previousPapers.courseId, cid)
              )
            );
        } else {
          await tx.insert(previousPapers).values({ ...paper, courseId: cid });
        }
      }

      return oldCode;
    });

    revalidateCourse(data.code);
    if (previousCode && previousCode !== data.code) {
      revalidateCourse(previousCode);
    }
    return { ok: true, code: data.code };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: `Another course already uses the code ${data.code}`,
        field: "code",
      };
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return { ok: false, error: "This course no longer exists" };
    }
    console.error("saveCourse failed:", error);
    return { ok: false, error: "Couldn't save the course. Try again." };
  }
}

/** Saves several extracted courses; each one succeeds or fails on its own. */
export async function importCourses(items: CourseFormValues[]) {
  const session = await getSession();
  if (session?.user.role !== ROLES_ENUMS.ADMIN) {
    return { saved: [], failed: items.map((i) => i.code) };
  }
  const results = await Promise.all(items.map((item) => saveCourse(item)));
  return {
    saved: results.flatMap((r) => (r.ok ? [r.code] : [])),
    failed: items.flatMap((item, i) => (results[i].ok ? [] : [item.code])),
  };
}

export async function removeCourse(
  courseId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!canEditCourses(session?.user)) {
    return {
      ok: false,
      error: "Only admins, faculty and CRs can delete courses",
    };
  }
  try {
    // Child tables reference courses without ON DELETE CASCADE.
    const deleted = await db.transaction(async (tx) => {
      await tx.delete(chapters).where(eq(chapters.courseId, courseId));
      await tx
        .delete(booksAndReferences)
        .where(eq(booksAndReferences.courseId, courseId));
      await tx
        .delete(previousPapers)
        .where(eq(previousPapers.courseId, courseId));
      const [row] = await tx
        .delete(courses)
        .where(eq(courses.id, courseId))
        .returning({ code: courses.code });
      return row;
    });
    if (!deleted) return { ok: false, error: "This course no longer exists" };
    revalidateCourse(deleted.code);
    return { ok: true };
  } catch (error) {
    console.error("removeCourse failed:", error);
    return { ok: false, error: "Couldn't delete the course. Try again." };
  }
}
