import { HeaderBar } from "@/components/common/header-bar";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAttendanceRecordById } from "~/actions/student.record_personal";
import { ATTENDANCE_THRESHOLD } from "../standing";
import { SubjectDetail } from "./subject-detail";

type Props = { params: Promise<{ id: string; moderator: string }> };

export const metadata: Metadata = {
  title: "Subject attendance",
  description: "Attendance history for one subject.",
};

export default async function SubjectAttendancePage({ params }: Props) {
  const { id, moderator } = await params;
  const record = await getAttendanceRecordById(id);
  if (!record) notFound();

  const basePath = `/${moderator}/attendance-personal`;
  const subjectName = record.subjectName.replaceAll("&amp;", "&");

  return (
    <div className="@container flex w-full flex-col gap-8">
      <HeaderBar
        Icon={ClipboardCheck}
        titleNode={subjectName}
        descriptionNode={
          <p>
            <span className="font-mono">{record.subjectCode}</span>. Minimum{" "}
            {ATTENDANCE_THRESHOLD}%, the platform default.
          </p>
        }
        actionNode={
          <ButtonLink href={basePath} variant="outline">
            <ArrowLeft aria-hidden="true" />
            All subjects
          </ButtonLink>
        }
      />
      <SubjectDetail subject={{ ...record, subjectName }} basePath={basePath} />
    </div>
  );
}
