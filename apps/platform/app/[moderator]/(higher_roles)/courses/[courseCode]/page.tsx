import { HeaderBar } from "@/components/common/header-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseByCode } from "~/actions/common.course"; // Ensure path is correct
import { EditCourseLayout } from "./client";

export default async function EditCoursePage(props: {
    params: Promise<{ moderator: string; courseCode: string }>;
}) {
    const params = await props.params;
    const { course, booksAndReferences, previousPapers, chapters } = await getCourseByCode(params.courseCode);

    if (!course) {
        return notFound();
    }

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 space-y-8">
            {/* 1. Global Context Header */}
            <HeaderBar
                Icon={BookOpen}
                titleNode={
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold tracking-tight">Edit Course</h1>
                        <Badge variant="outline" className="font-mono text-xs uppercase">
                            {course.code}
                        </Badge>
                    </div>
                }
                descriptionNode={`Manage curriculum and resources for ${course.name}`}
                actionNode={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/syllabus/${course.code}`}>View Public Page</Link>
                        </Button>
                    </div>
                }
            />

            {/* 2. Client Layout (Tabs & Forms) */}
            <EditCourseLayout
                course={course}
                initialChapters={chapters}
                initialBooks={booksAndReferences}
                initialPapers={previousPapers}
            />
        </div>
    );
}