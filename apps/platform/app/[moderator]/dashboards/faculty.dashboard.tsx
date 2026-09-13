import {
  DashboardHeader,
  DashboardRoot,
  DashboardSection,
} from "@/components/application/dashboard/primitives";
import { getViewer, greeting } from "@/components/application/dashboard/viewer";
import { RouterCard } from "@/components/common/router-card";
import { BookOpen, CalendarDays, DoorOpen, Presentation } from "lucide-react";

export default async function FacultyDashboard({ role }: { role: string }) {
  const viewer = await getViewer();
  return (
    <DashboardRoot>
      <DashboardHeader
        title={greeting(viewer?.name)}
        context="Your classes, courses and rooms in one place."
      />
      <DashboardSection id="teaching" title="Teaching">
        <div className="grid grid-cols-1 gap-3 @xl:grid-cols-2">
          <RouterCard
            href={`/${role}/classes`}
            title="My classes"
            description="Sections you teach and their students."
            Icon={Presentation}
          />
          <RouterCard
            href={`/${role}/courses`}
            title="Courses"
            description="Course codes, credits and syllabus details."
            Icon={BookOpen}
          />
          <RouterCard
            href={`/${role}/schedules`}
            title="Timetables"
            description="Weekly schedules for every department."
            Icon={CalendarDays}
          />
          <RouterCard
            href={`/${role}/rooms`}
            title="Rooms"
            description="Classroom status and availability."
            Icon={DoorOpen}
          />
        </div>
      </DashboardSection>
    </DashboardRoot>
  );
}
