"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
    BookReferenceSelect,
    ChapterSelect,
    CourseSelect,
    PreviousPaperSelect
} from "src/db/schema/course"; // Update import path
import { CurriculumManager } from "../forms/curriculum-manager";
import { GeneralSettingsForm } from "../forms/general-settings";
import { ResourceManager } from "../forms/resource-manager";

interface EditLayoutProps {
    course: CourseSelect;
    initialChapters: ChapterSelect[];
    initialBooks: BookReferenceSelect[];
    initialPapers: PreviousPaperSelect[];
}

// TODO: Implement Server Actions and UI for updating course details, chapters, and resources.
// These actions should handle form submissions from the respective forms below.

export function EditCourseLayout({ 
    course, 
    initialChapters, 
    initialBooks, 
    initialPapers 
}: EditLayoutProps) {
  return (
    <Tabs defaultValue="general" className="w-full space-y-8">
      
      {/* Navigation */}
      <div className="border-b">
        <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabTrigger value="general" label="General Settings" />
            <TabTrigger value="curriculum" label="Curriculum & Syllabus" />
            <TabTrigger value="resources" label="Books & Archives" />
        </TabsList>
      </div>

      {/* Content Area */}
      <div className="max-w-5xl">
          
          <TabsContent value="general" className="mt-0">
             <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Details</CardTitle>
                            <CardDescription>Basic information displayed on the course card.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GeneralSettingsForm course={course} />
                        </CardContent>
                    </Card>
                </div>
                {/* Sidebar / Helper Column */}
                <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900 text-sm space-y-2">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-200">Department Codes</h4>
                        <p className="text-blue-700 dark:text-blue-300">
                            Ensure the course code matches the department prefix (e.g., CS-101 for Computer Science).
                        </p>
                    </div>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="curriculum" className="mt-0">
             <CurriculumManager courseId={course.id} initialChapters={initialChapters} />
          </TabsContent>

          <TabsContent value="resources" className="mt-0">
             <ResourceManager 
                courseId={course.id} 
                courseCode={course.code}
                initialBooks={initialBooks} 
                initialPapers={initialPapers} 
             />
          </TabsContent>

      </div>
    </Tabs>
  );
}

function TabTrigger({ value, label }: { value: string, label: string }) {
    return (
        <TabsTrigger 
            value={value}
            className="rounded-none border-b-2 border-transparent px-0 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none  data-[state=active]:bg-transparent bg-transparent hover:text-foreground transition-colors"
        >
            {label}
        </TabsTrigger>
    )
}