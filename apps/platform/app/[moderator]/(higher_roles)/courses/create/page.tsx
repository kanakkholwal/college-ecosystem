import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, BookPlus } from "lucide-react";
import type { Metadata } from "next";
import { getSession } from "~/auth/server";
import { canEditCourses, isAdmin } from "../../access";
import { CourseEditor } from "../forms/course-editor";

export const metadata: Metadata = {
  title: "New course",
  description: "Add a course with its units and references.",
};

export default async function CreateCoursePage({
  params,
}: {
  params: Promise<{ moderator: string }>;
}) {
  const [{ moderator }, session] = await Promise.all([params, getSession()]);
  const canEdit = canEditCourses(session?.user);

  return (
    <div className="flex flex-col gap-8">
      <HeaderBar
        Icon={BookPlus}
        titleNode="New course"
        descriptionNode="Only the basics and credits are required. Units and references can be added now or later."
        actionNode={
          <ButtonLink href={`/${moderator}/courses`} variant="ghost">
            <ArrowLeft />
            All courses
          </ButtonLink>
        }
      />
      {canEdit ? (
        <CourseEditor
          mode="create"
          moderator={moderator}
          allowImport={isAdmin(session?.user)}
        />
      ) : (
        <p
          role="alert"
          className="rounded-2xl border border-border bg-card p-5 text-body text-muted-foreground dark:bg-background"
        >
          Only admins, faculty and CRs can add courses.
        </p>
      )}
    </div>
  );
}
