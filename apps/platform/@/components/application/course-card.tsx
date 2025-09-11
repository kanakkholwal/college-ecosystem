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
import type { Session } from "~/auth/client";
import { getDepartmentCode } from "~/constants/core.departments";

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
      className={cn(
        "hover:shadow-lg hover:border-primary/75 animate-in popup",
        className
      )}
      style={style}
    >
      <CardHeader className="px-3 py-4">
        <CardTitle className="text-base">{course.name}</CardTitle>
        <CardDescription>{course.code}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-around items-stretch gap-3 text-center p-3 pt-0">
        <div>
          <p className="text-xs text-muted-foreground">Type</p>
          <p className="text-base font-semibold text-foreground">
            {course.type}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Credits</p>
          <p className="text-base font-bold text-foreground">
            {course.credits}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Department</p>
          <p className="text-base font-bold text-foreground">
            {getDepartmentCode(course.department)}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-end p-3 pt-0">
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
          effect="shineHover"
          asChild
        >
          <Link href={`/syllabus/${course.code}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
