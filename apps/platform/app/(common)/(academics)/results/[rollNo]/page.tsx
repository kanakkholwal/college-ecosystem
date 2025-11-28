import { MagicCard } from "@/components/animation/magic-card";
import AdUnit from "@/components/common/adsense";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviousPageLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  Target,
  TrendingDown,
  TrendingUp,
  TrendingUpDown,
  Trophy
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ResultTypeWithId } from "src/models/result";
import { getResultByRollNo } from "~/actions/common.result";
import { orgConfig } from "~/project.config";
import { CGPIChart } from "./components/chart";

type Props = {
  params: Promise<{ rollNo: string }>;
  searchParams?: Promise<{ update?: string; new?: string }>;
};

export default async function ResultsPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const update_result = searchParams?.update === "1";
  const is_new = searchParams?.new === "1";
  const result = await getResultByRollNo(params.rollNo, update_result, is_new);

  if (!result) return notFound();

  const maxCgpi = Math.max(...result.semesters.map((s) => s.cgpi), 0);
  const minCgpi = Math.min(...result.semesters.map((s) => s.cgpi), ...(result.semesters.length > 0 ? [maxCgpi] : [0]));
  const cgpi = result.semesters.at(-1)?.cgpi ?? 0;
  const prevCgpi = result.semesters.length > 1 ? result.semesters.at(-2)?.cgpi : undefined;
  const totalCourses = result.semesters.reduce((acc, s) => acc + s.courses.length, 0);

  // course with 0 cgpi are considered as not passed
  const failedCourses = result.semesters.reduce(
    (acc, s) => acc + s.courses.filter((c) => c.cgpi === 0).length,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      {/* Header Section */}
      <section id="hero" className="w-full py-6 md:py-10">
        <PreviousPageLink size="sm" variant="ghost" className="mb-4" />

        {/* Hero Card - Minimal */}
        <MagicCard className="rounded-2xl bg-card/20" layerClassName="bg-card">

          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Student Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex items-center justify-center size-16 md:w-20 md:h-20 rounded-xl bg-primary/10 text-primary shrink-0",
                    result.rank.college <= 3 ? getRankColor(result.rank.college) :
                      " bg-primary/10 border border-primary/20",
                    result.rank.college <= 3 ? " bg-gradient-to-br" : "",
                  )}>
                    <div className="text-center">
                      {result.rank.college <= 3 ? (
                        <Trophy className="size-5 md:size-6 text-white mx-auto mb-1" />
                      ) : <Award className="size-5 md:size-6 text-primary mx-auto mb-1" />}
                      <span className={cn("text-xs md:text-base font-bold", result.rank.college <= 3 ? "text-white" : " text-primary")}>#{result.rank.college}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl tracking-tight mb-2 text-foreground">
                      {result.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-sm md:text-base font-medium text-muted-foreground">
                        {result.rollNo}
                      </span>
                      <Link
                        href={`mailto:${result.rollNo}${orgConfig.mailSuffix}`}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Contact via mail"
                      >
                        <Mail className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="gap-1">
                        <Calendar className="size-3" />
                        {getYear(result)}
                      </Badge>
                      <Badge className="gap-1">
                        <BookOpen className="size-3" />
                        {result.branch}
                      </Badge>
                      <Badge className="gap-1">
                        <GraduationCap className="size-3" />
                        {result.programme}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* CGPI Highlight */}
              <div className="flex flex-col justify-center items-center lg:items-end">
                <div className="bg-muted/50 hover:bg-muted border rounded-xl p-4 md:p-6 w-full max-w-xs text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {prevCgpi !== undefined && (
                      <>
                        {cgpi > prevCgpi ? (
                          <TrendingUp className="size-4 text-green-600 dark:text-green-400" />
                        ) : cgpi < prevCgpi ? (
                          <TrendingDown className="size-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <TrendingUpDown className="size-4 text-muted-foreground" />
                        )}
                      </>
                    )}
                    <p className="text-sm font-medium text-muted-foreground">Current CGPI</p>
                  </div>
                  <p className={cn("text-4xl md:text-5xl font-bold mb-1", getCgpiTrendColor(cgpi, prevCgpi))}>
                    {cgpi.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {result.semesters.length} Semesters • {totalCourses} Courses
                    {failedCourses > 0 && (
                      <span className="text-rose-600 dark:text-rose-400">
                        , {failedCourses} Failed
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </MagicCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">
          <StatCard  Icon={Target} label="Max CGPI" value={maxCgpi.toFixed(2)} color="blue" />
          <StatCard  Icon={BarChart3} label="Min CGPI" value={minCgpi.toFixed(2)} color="purple" />
          <StatCard  Icon={Award} label="Batch Rank" value={`#${result.rank.batch}`} color="orange" />
          <StatCard  Icon={Trophy} label="Branch Rank" value={`#${result.rank.branch}`} color="green" />
        </div>

        <AdUnit adSlot="display-horizontal" key={"results-page-ad-header-" + result.rollNo} />

      </section>

      {/* Semester Results */}
      <section className="mt-8 md:mt-12 mb-8">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Academic Performance</h2>
          <p className="text-sm text-muted-foreground">Semester-wise breakdown of courses and grades</p>
        </div>

        <Tabs defaultValue="table" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="table" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="graph" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Progress
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="space-y-3">
            {result.semesters.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                No semester data available.
              </p>
            )}
            <Accordion type="single" collapsible defaultValue={result.semesters?.[0]?.semester.toString()}>
              {result.semesters?.map((semester) => (
                <AccordionItem value={semester.semester.toString()} key={semester.semester} className="border-0 mb-3">
                  <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                    <AccordionTrigger className="hover:no-underline px-4 md:px-6 py-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 px-3 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">{semester.semester}</span>
                          </div>
                          <div className="text-left">
                            <h4 className="text-base font-semibold">Semester {semester.semester}</h4>
                            <p className="text-xs text-muted-foreground">{semester.courses.length} courses</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                          <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-md font-medium">
                            CGPI: {semester.cgpi}
                          </div>
                          <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md font-medium">
                            SGPI: {semester.sgpi}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 md:px-6 pb-4">
                      <div className="space-y-2 pt-2">
                        {semester.courses.map((course) => (
                          <div key={course.code} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex-1 min-w-0 mr-4">
                              <h4 className="text-sm font-medium truncate">{course.name.replaceAll("&amp;", "&")}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{course.code}</p>
                            </div>
                            <div className="shrink-0">
                              <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full min-w-[3rem] text-center">
                                {course.cgpi}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="graph">
            <CGPIChart semesters={result.semesters} />
          </TabsContent>
        </Tabs>
      </section>

      <AdUnit adSlot="display-horizontal" key={"results-page-ad-footer-" + result.rollNo} />
    </div>
  );
}
const getRankColor = (rank: number) => {
  if (rank === 1)
    return "from-[#FEE140] to-[#FA709A]"; // gold-pink
  if (rank === 2)
    return "from-[#89F7FE] to-[#66A6FF]"; // icy blue-silver
  if (rank === 3)
    return "from-[#FAD961] to-[#F76B1C]"; // bronze-orange
  return "from-[#6EE7B7] to-[#3B82F6]"; // default vibrant teal-blue
};
const getCgpiTrendColor = (cgpi: number, prevCgpi?: number) => {
  if (prevCgpi === undefined) return "text-muted-foreground";
  if (cgpi > prevCgpi) return "text-emerald-600 dark:text-emerald-400";
  if (cgpi < prevCgpi) return "text-rose-600 dark:text-rose-400";
  return "text-muted-foreground";
};
/* Stat Card Component */
function StatCard({
  Icon,
  label,
  value,
  color = "primary"
}: {
  Icon: React.ElementType;
  label: string;
  value: string;
  color?: "blue" | "green" | "purple" | "orange" | "primary";
}) {
  const colorClasses = {
    blue: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    green: "from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-600 dark:text-green-400",
    purple: "from-purple-500/10 to-violet-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
    orange: "from-orange-500/10 to-amber-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
    primary: "from-primary/10 to-primary/5 border-primary/20 text-primary"
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4" />
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
        <p className="text-xl md:text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { rollNo } = await params;
  return {
    title: `${rollNo} | Results`,
    description: `Check the results of ${rollNo}`,
    alternates: { canonical: "/results/" + rollNo },
  };
}

function getYear(result: ResultTypeWithId): string | null {
  switch (result.semesters.length) {
    case 0:
    case 1:
      return "First Year";
    case 2:
    case 3:
      return "Second Year";
    case 4:
    case 5:
      return "Third Year";
    case 6:
    case 7:
      return result.programme === "B.Tech"
        ? "Final Year"
        : "Final Year (Dual Degree)";
    case 8:
      return result.programme === "B.Tech"
        ? "Alumni"
        : "Super Final Year (Dual Degree)";
    case 9:
      return "Super Final Year (Dual Degree)";
    case 10:
      return "Alumni";
    default:
      return "Unknown Year";
  }
}
