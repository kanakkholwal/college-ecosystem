import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseByCode } from "~/actions/common.course";
import { getSession } from "~/auth/server";
import { canEditCourses } from "../../access";
import { CourseEditor } from "../forms/course-editor";
import { DeleteCourse } from "../forms/delete-course";
import type { CourseFormValues } from "../forms/schema";

type Props = {
  params: Promise<{ moderator: string; courseCode: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseCode } = await params;
  return { title: `Edit ${courseCode}` };
}

export default async function EditCoursePage({ params }: Props) {
  const { moderator, courseCode } = await params;
  const code = courseCode;
  const [data, session] = await Promise.all([
    getCourseByCode(code),
    getSession(),
  ]);
  const { course } = data;
  if (!course) notFound();

  const canEdit = canEditCourses(session?.user);
  const defaultValues: CourseFormValues = {
    name: course.name,
    code: course.code,
    department: course.department,
    type: course.type,
    credits: course.credits,
    outcomes: course.outcomes.map((value) => ({ value })),
    chapters: data.chapters.map((c) => ({
      title: c.title,
      lectures: c.lectures ?? 0,
      topics: c.topics.join("\n"),
    })),
    books: data.booksAndReferences.map((b) => ({
      id: b.id,
      name: b.name,
      type: b.type as CourseFormValues["books"][number]["type"],
      link: b.link,
    })),
    papers: data.previousPapers.map((p) => ({
      id: p.id,
      year: p.year,
      exam: p.exam as CourseFormValues["papers"][number]["exam"],
      link: p.link,
    })),
  };

  return (
    <div className="flex flex-col gap-8">
      <HeaderBar
        Icon={BookOpen}
        titleNode={course.name}
        descriptionNode={
          <p>
            <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-caption text-foreground">
              {course.code}
            </span>{" "}
            {canEdit
              ? "Save once when you're done; every section is saved together."
              : "Read only. Only admins, faculty and CRs can edit courses."}
          </p>
        }
        actionNode={
          <ButtonLink
            href={`/syllabus/${encodeURIComponent(course.code)}`}
            variant="outline"
            prefetch={false}
          >
            Public page
            <ArrowUpRight />
          </ButtonLink>
        }
      />
      {/* Remounts after a save so new rows pick up their database ids. */}
      <CourseEditor
        key={String(course.updatedAt ?? course.id)}
        mode="edit"
        moderator={moderator}
        readOnly={!canEdit}
        courseId={course.id}
        initialCode={course.code}
        defaultValues={defaultValues}
      />
      {canEdit && (
        <DeleteCourse
          courseId={course.id}
          code={course.code}
          moderator={moderator}
        />
      )}
    </div>
  );
}
