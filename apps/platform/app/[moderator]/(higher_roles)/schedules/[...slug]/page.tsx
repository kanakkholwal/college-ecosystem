import { HeaderBar } from "@/components/common/header-bar";
import { TimeTableEditor } from "@/components/custom/time-table";
import { ButtonLink } from "@/components/utils/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import { getTimeTable } from "src//actions/common.time-table";

interface Props {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function Dashboard(props: Props) {
  const params = await props.params;
  const [department_code, year, semester] = params.slug as [
    string,
    string,
    string,
  ];

  const timetableData = await getTimeTable(
    department_code,
    Number(year),
    Number(semester)
  );
  if (!timetableData) return notFound();

  return (
    <>
      <HeaderBar
        Icon={CalendarDays}
        titleNode={
          <>
            Edit Timetable{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {timetableData.sectionName || "Untitled Timetable"}
            </span>
          </>
        }
        descriptionNode="Here you can edit the timetable details and manage the schedule."
        actionNode={
          <ButtonLink
            variant="dark"
            size="sm"
            href={`/schedules/${params.slug.join("/")}`}
            target="_blank"
          >
            View Timetable
            <ArrowUpRight />
          </ButtonLink>
        }
      />
      <TimeTableEditor timetableData={timetableData} mode="edit" />
    </>
  );
}
