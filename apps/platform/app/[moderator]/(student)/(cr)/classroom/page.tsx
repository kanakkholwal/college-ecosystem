import { EmptyNote } from "@/components/application/dashboard/primitives";
import { HeaderBar } from "@/components/common/header-bar";
import { RouterCard } from "@/components/common/router-card";
import { CalendarDays, DoorOpen, Megaphone, Presentation } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ROLES_ENUMS } from "~/constants";

export const metadata: Metadata = {
  title: "Classroom",
  description: "Class tools for class representatives.",
};

type Props = { params: Promise<{ moderator: string }> };

// The dashboard layout already checks the viewer holds this role; only the CR dashboard owns this page.
export default async function ClassroomPage({ params }: Props) {
  const { moderator } = await params;
  if (moderator !== ROLES_ENUMS.CR) notFound();

  return (
    <div className="@container flex w-full flex-col gap-8">
      <HeaderBar
        Icon={Presentation}
        titleNode="Classroom"
        descriptionNode="Tools for running your class as its representative."
      />
      <EmptyNote
        icon={<Presentation />}
        title="Class management isn't built yet"
        description="A roster of your section and class-wide notices will live here. Until then, the tools below already work."
      />
      <section aria-labelledby="tools-heading" className="flex flex-col gap-4">
        <h2
          id="tools-heading"
          className="text-subheading font-medium text-foreground"
        >
          Working class tools
        </h2>
        <div className="grid grid-cols-1 gap-3 @xl:grid-cols-3">
          <RouterCard
            href={`/${moderator}/rooms`}
            title="Update room status"
            description="Mark a classroom as occupied or free."
            Icon={DoorOpen}
          />
          <RouterCard
            href={`/${moderator}/schedules`}
            title="Timetables"
            description="Create or edit your section's weekly schedule."
            Icon={CalendarDays}
          />
          <RouterCard
            href="/announcements/create"
            title="Post an announcement"
            description="Share a notice with your batch."
            Icon={Megaphone}
          />
        </div>
      </section>
    </div>
  );
}
