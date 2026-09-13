import { SectionError } from "@/components/application/dashboard/primitives";
import { KpiGridSkeleton } from "@/components/application/stats-card";
import { HeaderBar } from "@/components/common/header-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { ClipboardCheck } from "lucide-react";
import type { Metadata } from "next";
import { getAttendanceSubjects } from "~/actions/student.record_personal";
import { AddSubjectButton } from "./add-subject";
import { AttendanceBoard } from "./attendance-board";
import { ATTENDANCE_THRESHOLD } from "./standing";

export const metadata: Metadata = {
  title: "Attendance",
  description: "Track your attendance for every subject.",
};

type Props = { params: Promise<{ moderator: string }> };

export default async function PersonalAttendancePage({ params }: Props) {
  const { moderator } = await params;

  return (
    <div className="@container flex w-full flex-col gap-8">
      <HeaderBar
        Icon={ClipboardCheck}
        titleNode="Attendance"
        descriptionNode={`Your own record of every class. The minimum is set to ${ATTENDANCE_THRESHOLD}% because the platform has no department rule on file; check your department's rule if it differs.`}
        actionNode={<AddSubjectButton />}
      />
      <ErrorBoundaryWithSuspense
        loadingFallback={<BoardSkeleton />}
        fallback={<SectionError what="Your attendance" />}
      >
        <Board basePath={`/${moderator}/attendance-personal`} />
      </ErrorBoundaryWithSuspense>
    </div>
  );
}

async function Board({ basePath }: { basePath: string }) {
  const subjects = await getAttendanceSubjects();
  return (
    <AttendanceBoard
      basePath={basePath}
      subjects={subjects.map((s) => ({
        ...s,
        subjectName: s.subjectName.replaceAll("&amp;", "&"),
      }))}
    />
  );
}

function BoardSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true">
      <KpiGridSkeleton count={3} />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-32 bg-muted" />
        <div className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @5xl:grid-cols-3">
          {["a", "b", "c"].map((k) => (
            <div
              key={k}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 dark:bg-background"
            >
              <Skeleton className="h-5 w-40 bg-muted" />
              <Skeleton className="h-9 w-24 bg-muted" />
              <Skeleton className="h-2 w-full bg-muted" />
              <Skeleton className="h-4 w-56 bg-muted" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-11 rounded-md bg-muted" />
                <Skeleton className="h-11 rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
