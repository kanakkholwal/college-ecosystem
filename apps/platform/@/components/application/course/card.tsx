import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { CourseSelect } from "src/db/schema/course";
import {
  getDepartmentCode,
  getDepartmentShort,
} from "~/constants/core.departments";

type Props = {
  course: CourseSelect;
  className?: string;
  /** Moderator segment; when set, the card opens the editor and a side link opens the syllabus. */
  authorized_role?: string;
  style?: React.CSSProperties;
};

export default function CourseCard({
  course,
  className,
  authorized_role,
  style,
}: Props) {
  const department =
    getDepartmentShort(getDepartmentCode(course.department)) ||
    course.department;
  const publicHref = `/syllabus/${encodeURIComponent(course.code)}`;
  const href = authorized_role
    ? `/${authorized_role}/courses/${encodeURIComponent(course.code)}`
    : publicHref;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow] duration-200 has-[a[data-card-link]:focus-visible]:ring-2 has-[a[data-card-link]:focus-visible]:ring-ring hover:border-border-strong hover:shadow-md dark:bg-background",
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-caption text-muted-foreground">
          <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-foreground">
            {course.code}
          </span>
          <span className="truncate" title={course.department}>
            {department}
          </span>
        </p>
        {authorized_role && (
          <ButtonLink
            href={publicHref}
            prefetch={false}
            variant="ghost"
            size="icon_sm"
            aria-label={`Open the public syllabus for ${course.code}`}
            className="relative z-10 -mt-1.5 -mr-1.5 shrink-0 text-muted-foreground"
          >
            <ArrowUpRight />
          </ButtonLink>
        )}
      </div>

      <h3 className="line-clamp-2 text-body-lg font-medium text-foreground">
        <Link
          href={href}
          prefetch={false}
          data-card-link
          className="outline-none after:absolute after:inset-0 after:rounded-2xl"
        >
          {course.name}
        </Link>
      </h3>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-caption">
        <span className="text-muted-foreground capitalize">
          {course.type} · {course.credits}{" "}
          {course.credits === 1 ? "credit" : "credits"}
        </span>
        <span
          aria-hidden="true"
          className="flex items-center gap-1 font-medium text-primary"
        >
          {authorized_role ? "Edit course" : "View syllabus"}
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 dark:bg-background">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <div className="flex justify-between border-t border-border pt-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
