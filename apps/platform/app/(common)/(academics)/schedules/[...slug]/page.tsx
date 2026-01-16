import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getTimeTable } from "~//actions/common.time-table";

import TimeTableViewer from "@/components/custom/time-table/viewer";
import { PreviousPageLink } from "@/components/utils/link";

interface Props {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const { slug } = await params;
  const [department_code, year, semester] = slug;

  return {
    title: `Semester ${semester} - ${year} | ${department_code} | Timetable`,
    description: `Timetable for ${department_code} department for semester ${semester} of year ${year}`,
  };
}

export default async function Dashboard({ params }: Props) {
  const { slug } = await params;
  const [department_code, year, semester] = slug;

  const timetableData = await getTimeTable(
    department_code,
    Number(year),
    Number(semester)
  );
  if (!timetableData) return notFound();

  return (
    <>
      <div className="mt-5 p-3">
        <PreviousPageLink size="sm" variant="ghost" />
      </div>

      <TimeTableViewer timetableData={timetableData} />
    </>
  );
}
