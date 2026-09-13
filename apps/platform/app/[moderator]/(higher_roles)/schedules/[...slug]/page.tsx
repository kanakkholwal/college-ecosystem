import { HeaderBar } from "@/components/common/header-bar";
import { TimeTableEditor } from "@/components/custom/time-table";
import TimeTableViewer from "@/components/custom/time-table/viewer";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, ArrowUpRight, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTimeTables, getTimeTable } from "~/actions/common.time-table";
import { getSession } from "~/auth/server";
import {
  DEPARTMENT_CODES,
  getDepartmentName,
} from "~/constants/core.departments";
import { canManageTimetables } from "../../access";

type Props = {
  params: Promise<{ moderator: string; slug: string[] }>;
};

/** `:department/:year/:semester[/:section]`; anything else is a 404. */
function parseSlug(slug: string[]) {
  if (slug.length !== 3 && slug.length !== 4) return null;
  const [department_code, year, semester, section] = slug;
  if (!DEPARTMENT_CODES.includes(department_code)) return null;
  if (!/^\d{1,2}$/.test(year) || !/^\d{1,2}$/.test(semester)) return null;
  return {
    department_code,
    year: Number(year),
    semester: Number(semester),
    sectionName: section ? safeDecode(section) : undefined,
  };
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsed = parseSlug((await params).slug);
  return {
    title: parsed?.sectionName
      ? `Edit ${parsed.sectionName} timetable`
      : "Edit timetable",
  };
}

export default async function EditTimetablePage({ params }: Props) {
  const { moderator, slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();

  const [timetable, all, session] = await Promise.all([
    getTimeTable(
      parsed.department_code,
      parsed.year,
      parsed.semester,
      parsed.sectionName
    ),
    getAllTimeTables().catch(() => []),
    getSession(),
  ]);
  if (!timetable) notFound();

  const canManage = canManageTimetables(session?.user);
  // The public route has no section segment, so link it only when this is the semester's one section.
  const onlySection =
    all.filter(
      (t) =>
        t.department_code === timetable.department_code &&
        t.year === timetable.year &&
        t.semester === timetable.semester
    ).length <= 1;
  const department = getDepartmentName(timetable.department_code);

  return (
    <div className="flex flex-col gap-8">
      <HeaderBar
        Icon={CalendarDays}
        titleNode={timetable.sectionName || "Untitled section"}
        descriptionNode={`${department === "other" ? "No department" : department}, year ${timetable.year}, semester ${timetable.semester}. ${
          canManage
            ? "Edit slots in Week and section details in Details, then save."
            : "Read only. Only admins, faculty and CRs can edit timetables."
        }`}
        actionNode={
          <>
            <ButtonLink href={`/${moderator}/schedules`} variant="ghost">
              <ArrowLeft />
              All timetables
            </ButtonLink>
            {onlySection && (
              <ButtonLink
                href={`/schedules/${timetable.department_code}/${timetable.year}/${timetable.semester}`}
                variant="outline"
                prefetch={false}
                target="_blank"
              >
                Public page
                <ArrowUpRight />
              </ButtonLink>
            )}
          </>
        }
      />
      {canManage ? (
        <TimeTableEditor
          key={timetable._id}
          timetableData={timetable}
          mode="edit"
        />
      ) : (
        <TimeTableViewer timetableData={timetable} />
      )}
    </div>
  );
}
