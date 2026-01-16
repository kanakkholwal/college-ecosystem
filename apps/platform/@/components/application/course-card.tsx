import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, Edit2, Hash, Layers } from "lucide-react";
import Link from "next/link";
import type { CourseSelect } from "src/db/schema/course";
import { getDepartmentCode } from "~/constants/core.departments";

type Props = {
  course: CourseSelect;
  className?: string;
  authorized_role?: string;
  style?: React.CSSProperties;
};

export default function CourseCard({
  course,
  className,
  authorized_role,
  style,
}: Props) {
  const deptCode = getDepartmentCode(course.department);
  const theme = getDepartmentTheme(deptCode);

  return (
    <Card
      className={cn(
        "group relative flex flex-col h-full bg-card/50 hover:bg-card transition-all duration-300",
        "border border-border/40 hover:border-border/80",
        "shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)]",
        className
      )}
      style={style}
    >
      {/* Edit Action (Visible on Hover for Admins) */}
      {authorized_role && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
            asChild
          >
            <Link href={`/${authorized_role}/courses/${course.code}`}>
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </Button>
        </div>
      )}

      <CardHeader className="p-5 pb-3 space-y-3">
        {/* Top Meta Row */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border-0",
              theme.badge
            )}
          >
            {deptCode} Dept
          </Badge>
          
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
             <Layers className="h-3.5 w-3.5 opacity-70" />
             <span>{course.credits} Credits</span>
          </div>
        </div>

        {/* Title Area */}
        <div className="space-y-2 pt-1">
            <h3 className="font-bold text-lg leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
                {course.name}
            </h3>
            
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-muted/50 border border-border px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                    <Hash className="h-3 w-3 opacity-50" /> {course.code}
                </span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[11px] text-muted-foreground capitalize">{course.type} Course</span>
            </div>
        </div>
      </CardHeader>

  

      <CardFooter className="p-5 pt-0 mt-auto">
         <Button 
            className="w-full justify-between group/btn bg-muted/40 hover:bg-primary hover:text-primary-foreground text-foreground border border-border/50 shadow-none transition-all duration-300"
            variant="outline"
            asChild
         >
            <Link href={`/syllabus/${course.code}`}>
               <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 opacity-70" />
                  <span className="font-medium">View Syllabus</span>
               </span>
               <ArrowRight className="h-4 w-4 opacity-50 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
            </Link>
         </Button>
      </CardFooter>
    </Card>
  );
}

// Helper for Subtle Themes (Pastels)
function getDepartmentTheme(code: string = "GEN") {
    const c = code.toUpperCase();
    
    // Returning classes for the Badge background and text
    if (c.includes("CS") || c.includes("IT")) {
        return { badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" };
    }
    if (c.includes("EC") || c.includes("EE")) {
        return { badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" };
    }
    if (c.includes("ME") || c.includes("CV")) {
        return { badge: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" };
    }
    if (c.includes("AS") || c.includes("HU")) {
        return { badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" };
    }
    
    return { badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
}