import AdUnit from "@/components/common/adsense";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviousPageLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Calendar,
  GraduationCap,
  LineChart,
  Mail,
  Target,
  TrendingDown,
  TrendingUp,
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

// --- Helpers ---
const getRankColor = (rank: number) => {
  if (rank === 1) return "bg-pink-500/10 text-pink-600 border-pink-500/20";
  if (rank === 2) return "bg-rose-400/10 text-rose-600 border-rose-400/20";
  if (rank === 3) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  return "bg-primary/5 text-primary border-primary/20";
};

// function getYear(result: ResultTypeWithId): string {
//   const s = result.semesters.length;
//   if (s <= 2) return "First Year";
//   if (s <= 4) return "Second Year";
//   if (s <= 6) return "Third Year";
//   return result.programme.includes("Dual") && s > 8 ? "Super Final Year" : "Final Year";
// }
function getYear(result: ResultTypeWithId): string  {
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
      return "Final Year";
    case 8:
      return result.programme === "B.Tech" ? "Pass Out" : "Super Final Year";
    case 9:
      return "Super Final Year";
    case 10:
      return "Pass Out";
    default:
      return "Unknown Year";
  }
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rollNo } = await params;
  return {
    title: `${rollNo} | Academic Performance`,
    description: `Detailed academic results and performance analysis for ${rollNo}`,
    alternates: { canonical: "/results/" + rollNo },
  };
}

export default async function ResultsPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const update_result = searchParams?.update === "1";
  const is_new = searchParams?.new === "1";

  const result = await getResultByRollNo(params.rollNo, update_result, is_new);
  if (!result) return notFound();

  // --- Calculations ---
  const cgpiValues = result.semesters.map((s) => s.cgpi);
  const maxCgpi = Math.max(...cgpiValues, 0);
  const minCgpi = Math.min(...cgpiValues, maxCgpi); // Prevent 0 min if not true
  const currentCgpi = result.semesters.at(-1)?.cgpi ?? 0;
  const prevCgpi = result.semesters.length > 1 ? result.semesters.at(-2)?.cgpi : undefined;
  const trend = prevCgpi ? currentCgpi - prevCgpi : 0;

  const totalCourses = result.semesters.reduce((acc, s) => acc + s.courses.length, 0);
  const failedCourses = result.semesters.reduce(
    (acc, s) => acc + s.courses.filter((c) => c.cgpi === 0).length,
    0
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6">
        <PreviousPageLink size="sm" variant="ghost" className="mb-6 text-muted-foreground" />

        {/* --- 1. PROFILE HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
          <div className="flex items-start gap-5">
            {/* Avatar Placeholder */}
            <div className="flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 text-2xl font-bold text-primary shadow-sm">
              {result.name.charAt(0)}
            </div>

            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {result.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                  {result.rollNo}
                </span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-3.5" /> {result.branch}
                </span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> {getYear(result)}
                </span>
              </div>
              <div className="pt-2 flex gap-2">
                <Button size="xs" variant="outline" className="h-7 text-xs gap-1.5" asChild>
                  <Link href={`mailto:${result.rollNo}${orgConfig.mailSuffix}`}>
                    <Mail className="size-3" /> Email Student
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Rank Badge (Mobile/Desktop) */}
          <div className="flex flex-col items-end gap-2">
            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider", getRankColor(result.rank.college))}>
              <Trophy className="size-3.5" />
              College Rank #{result.rank.college}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">

          {/* Main Stat: CGPI */}
          <Card className="md:col-span-4 lg:col-span-3 border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Target className="size-24" />
            </div>
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Cumulative GPI</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tighter text-foreground">
                    {currentCgpi.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">/ 10</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md", trend >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
                  {trend > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {Math.abs(trend).toFixed(2)}
                </div>
                <span className="text-xs text-muted-foreground">vs last sem</span>
              </div>
            </CardContent>
          </Card>

          {/* Rank Breakdown */}
          <Card className="md:col-span-8 lg:col-span-5 border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
                <Award className="size-4" /> Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="grid grid-cols-3 gap-4">
                <RankBox label="Batch" rank={result.rank.batch} total="All" />
                <div className="w-px bg-border/50 h-full mx-auto" />
                <RankBox label="Branch" rank={result.rank.branch} total={result.branch} />
                <div className="w-px bg-border/50 h-full mx-auto" />
                <RankBox label="Class" rank={result.rank.class} total="Sec" />
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <Card className="md:col-span-12 lg:col-span-4 border-border/50 shadow-sm bg-card">
            <CardContent className="p-6 flex flex-col justify-center h-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="size-4" /> Total Courses
                </span>
                <span className="font-mono font-medium">{totalCourses}</span>
              </div>
              <Separator className="bg-border/50" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <ArrowUpRight className="size-4" /> Highest SGPI
                </span>
                <span className="font-mono font-medium text-emerald-600">{maxCgpi.toFixed(2)}</span>
              </div>
              <Separator className="bg-border/50" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="size-4" /> Lowest SGPI
                </span>
                <span className="font-mono font-medium text-amber-600">{minCgpi.toFixed(2)}</span>
              </div>
              {failedCourses > 0 && (
                <>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-rose-600 font-medium flex items-center gap-2">
                      Backlogs
                    </span>
                    <span className="font-mono font-bold text-rose-600">{failedCourses}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <AdUnit adSlot="display-horizontal" key={"results-header-ad"} />

        {/* --- 3. ACADEMIC TIMELINE --- */}
        <div className="mt-12">
          <Tabs defaultValue="table" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">Academic History</h2>
              <TabsList className="h-9">
                <TabsTrigger value="table" className="text-xs gap-1.5"><BookOpen className="size-3.5" /> Detail</TabsTrigger>
                <TabsTrigger value="graph" className="text-xs gap-1.5"><LineChart className="size-3.5" /> Graph</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="table" className="space-y-4">
              {result.semesters.map((sem, idx) => (
                <Accordion type="single" collapsible key={sem.semester} defaultValue={idx === 0 ? sem.semester.toString() : undefined}>
                  <AccordionItem value={sem.semester.toString()} className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-sm mb-4 px-0">
                    <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 hover:no-underline transition-all group">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center size-10 rounded-lg bg-primary/5 border border-primary/10 group-hover:border-primary/30 transition-colors">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Sem</span>
                            <span className="text-sm font-bold text-primary">{sem.semester}</span>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-muted-foreground font-mono">
                              Credits: {sem.courses.length * 4} {/* Approx */}
                            </p>
                            <div className="flex gap-3 mt-0.5">
                              <span className="text-sm font-medium">
                                SGPI: <span className="text-foreground font-bold">{sem.sgpi}</span>
                              </span>
                              <span className="text-sm font-medium text-muted-foreground">
                                CGPI: <span className="text-foreground">{sem.cgpi}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Visual Bar for SGPI */}
                        <div className="hidden sm:block w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", sem.sgpi >= 8.5 ? "bg-emerald-500" : sem.sgpi >= 7 ? "bg-primary" : "bg-amber-500")}
                            style={{ width: `${(sem.sgpi / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-0 pb-0 border-t border-border/50">
                      <div className="divide-y divide-border/40">
                        {sem.courses.map((course) => (
                          <div key={course.code} className="flex items-center justify-between p-3 px-4 hover:bg-muted/20 transition-colors">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-sm font-medium text-foreground truncate">
                                {course.name.replace(/&amp;/g, '&')}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                {course.code}
                              </p>
                            </div>
                            <div className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border",
                              course.cgpi >= 9 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                course.cgpi >= 7 ? "bg-primary/5 text-primary border-primary/20" :
                                  course.cgpi === 0 ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                                    "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            )}>
                              {course.cgpi}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </TabsContent>

            <TabsContent value="graph" className="p-4 border rounded-xl bg-card min-h-[400px]">
              <CGPIChart semesters={result.semesters} />
            </TabsContent>
          </Tabs>
        </div>

        <AdUnit adSlot="display-horizontal" key={"results-footer-ad"} />
      </div>
    </div>
  );
}

// --- Sub-components ---

function RankBox({ label, rank, total }: { label: string; rank: number; total: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">#{rank}</span>
      </div>
      <span className="text-[10px] text-muted-foreground/60">{total}</span>
    </div>
  )
}
