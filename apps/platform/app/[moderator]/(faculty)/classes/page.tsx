import { EmptyNote } from "@/components/application/dashboard/primitives";
import { HeaderBar } from "@/components/common/header-bar";
import { RouterCard } from "@/components/common/router-card";
import { BookOpen, CalendarDays, DoorOpen, Presentation } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My classes",
  description: "Sections you teach.",
};

type Props = { params: Promise<{ moderator: string }> };

// Role is enforced by the (faculty) layout: faculty or HOD only.
export default async function FacultyClassesPage({ params }: Props) {
  const { moderator } = await params;

  return (
    <div className="@container flex w-full flex-col gap-8">
      <HeaderBar
        Icon={Presentation}
        titleNode="My classes"
        descriptionNode="Sections you teach and their students."
      />
      <EmptyNote
        icon={<Presentation />}
        title="Class rosters aren't on the platform yet"
        description="The platform doesn't yet link faculty to the sections they teach, so there is nothing to list. Your sections and their students will appear here once it does."
      />
      <section
        aria-labelledby="related-heading"
        className="flex flex-col gap-4"
      >
        <h2
          id="related-heading"
          className="text-subheading font-medium text-foreground"
        >
          What you can use today
        </h2>
        <div className="grid grid-cols-1 gap-3 @xl:grid-cols-3">
          <RouterCard
            href={`/${moderator}/courses`}
            title="Courses"
            description="Course codes, credits and syllabus details."
            Icon={BookOpen}
          />
          <RouterCard
            href={`/${moderator}/schedules`}
            title="Timetables"
            description="Weekly schedules for every department."
            Icon={CalendarDays}
          />
          <RouterCard
            href={`/${moderator}/rooms`}
            title="Rooms"
            description="Classroom status and availability."
            Icon={DoorOpen}
          />
        </div>
      </section>
    </div>
  );
}
