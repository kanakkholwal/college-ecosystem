import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import type { courses } from "src/db/schema";
import { getDepartmentCode } from "~/constants/departments";
import type { Session } from "~/lib/auth-client";

// Infer types for courses
type CourseSelect = InferSelectModel<typeof courses>;

type Props = {
  course: CourseSelect;
  className?: string;
  authorized_role?:
  | Session["user"]["role"]
  | Session["user"]["other_roles"][number];
  style?: React.CSSProperties;
};

export default function CourseCard({
  course,
  className,
  authorized_role,
  style,
}: Props) {
  return (
    <Card
      className={cn("hover:shadow-lg animate-in popup", className)}
      style={style}
    >
      <CardHeader className="px-3 py-4">

        <CardTitle className="text-base">{course.name}</CardTitle>
        <CardDescription className="text-sm font-medium">
          {course.code}
        </CardDescription>

      </CardHeader>
      <CardContent className="flex justify-around items-stretch gap-3 text-center p-3">
        <div>
          <p className="text-xs text-muted-foreground">Type</p>
          <p className="text-base font-bold text-gray-900 dark:text-white">
            {course.type}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Credits</p>
          <p className="text-base font-bold text-gray-900 dark:text-white">
            {course.credits}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Department</p>
          <p className="text-base font-bold text-gray-900 dark:text-white">
            {getDepartmentCode(course.department)}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-end p-3">
        {authorized_role && (
          <Button size="sm" variant="link" effect="hoverUnderline" asChild>
            <Link href={`/${authorized_role}/courses/${course.code}`}>
              Edit Course
            </Link>
          </Button>
        )}
        <Button
          size="sm"
          variant="default_light"
          rounded="full"
          effect="gooeyRight"
          asChild
        >
          <Link href={`/syllabus/${course.code}`} >
            View Course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
