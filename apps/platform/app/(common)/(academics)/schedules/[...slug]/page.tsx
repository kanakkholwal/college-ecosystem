import TimeTableViewer from "@/components/custom/time-table/viewer";
import { PreviousPageLink } from "@/components/utils/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTimeTable } from "~/actions/common.time-table";
import {
  DEPARTMENT_CODES,
  getDepartmentShort,
} from "~/constants/core.departments";

interface Props {
  params: Promise<{
    slug: string[];
  }>;
}

/** `/schedules/:department/:year/:semester`; anything else is a 404, not a failed DB cast. */
function parseSlug(slug: string[]) {
  if (slug.length !== 3) return null;
  const [department_code, year, semester] = slug;
  if (!DEPARTMENT_CODES.includes(department_code)) return null;
  if (!/^\d{1,2}$/.test(year) || !/^\d{1,2}$/.test(semester)) return null;
  return { department_code, year: Number(year), semester: Number(semester) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return { title: "Timetable not found" };
  const dept = getDepartmentShort(parsed.department_code);
  return {
    title: `${dept} Year ${parsed.year}, Semester ${parsed.semester} | Timetable`,
    description: `Weekly class timetable for ${dept}, year ${parsed.year}, semester ${parsed.semester}.`,
    alternates: { canonical: `/schedules/${slug.join("/")}` },
  };
}

export default async function TimetablePage({ params }: Props) {
  const parsed = parseSlug((await params).slug);
  if (!parsed) notFound();

  const timetableData = await getTimeTable(
    parsed.department_code,
    parsed.year,
    parsed.semester
  );
  if (!timetableData) notFound();

  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pt-6 pb-16 md:px-6">
      <PreviousPageLink
        size="sm"
        variant="ghost"
        className="mb-6 w-fit text-muted-foreground"
      />
      <TimeTableViewer timetableData={timetableData} />
    </div>
  );
}
