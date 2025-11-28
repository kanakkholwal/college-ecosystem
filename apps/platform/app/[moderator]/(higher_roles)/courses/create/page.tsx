import { HeaderBar } from "@/components/common/header-bar";
import { PlusCircle } from "lucide-react";
import { CreateCourseForm } from "./create-course-form";

export default async function CreateCoursePage({
  params,
}: {
  params: Promise<{ moderator: string }>;
}) {
  const { moderator } = await params;

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 space-y-8">
      <HeaderBar
        Icon={PlusCircle}
        titleNode={<h1 className="text-xl font-bold tracking-tight">Create New Course</h1>}
        descriptionNode="Define the course structure. You can add chapters and resources after creation."
      />

      <div className="max-w-4xl mx-auto">
        <CreateCourseForm moderator={moderator} />
      </div>
    </div>
  );
}