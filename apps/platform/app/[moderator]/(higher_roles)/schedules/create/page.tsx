import { HeaderBar } from "@/components/common/header-bar";
import { TimeTableEditor } from "@/components/custom/time-table";
import { ButtonLink } from "@/components/utils/link";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import type { Metadata } from "next";
import { getSession } from "~/auth/server";
import { canManageTimetables } from "../../access";

export const metadata: Metadata = {
  title: "New timetable",
  description: "Create a class timetable for one section.",
};

const STEPS = [
  "Open Details and set the section name, year, semester and department.",
  "Back in Week, select a slot to add its class, faculty and room.",
  "Create the timetable. You can keep editing it afterwards.",
];

export default async function CreateTimeTablePage({
  params,
}: {
  params: Promise<{ moderator: string }>;
}) {
  const [{ moderator }, session] = await Promise.all([params, getSession()]);
  const canManage = canManageTimetables(session?.user);

  return (
    <div className="flex flex-col gap-8">
      <HeaderBar
        Icon={CalendarPlus}
        titleNode="New timetable"
        descriptionNode={
          <ol className="flex list-decimal flex-col gap-1 pl-5">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        }
        actionNode={
          <ButtonLink href={`/${moderator}/schedules`} variant="ghost">
            <ArrowLeft />
            All timetables
          </ButtonLink>
        }
      />
      {canManage ? (
        <TimeTableEditor mode="create" />
      ) : (
        <p
          role="alert"
          className="rounded-2xl border border-border bg-card p-5 text-body text-muted-foreground dark:bg-background"
        >
          Only admins, faculty and CRs can create timetables.
        </p>
      )}
    </div>
  );
}
