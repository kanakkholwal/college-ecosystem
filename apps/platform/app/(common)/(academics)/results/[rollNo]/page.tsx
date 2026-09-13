import { RankChip, TrendDelta } from "@/components/application/result/card";
import { CGPIChartLazy } from "@/components/application/result/cgpi-chart-lazy";
import AdUnit from "@/components/common/adsense";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ButtonLink, PreviousPageLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  BookOpen,
  CalendarDays,
  ChartLine,
  ChevronDown,
  Mail,
  Table as TableIcon,
  TriangleAlert,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ResultTypeWithId } from "src/models/result";
import { getResultByRollNo } from "~/actions/common.result";
import { orgConfig } from "~/project.config";

type Props = {
  params: Promise<{ rollNo: string }>;
  searchParams?: Promise<{ update?: string; new?: string }>;
};

type Semester = ResultTypeWithId["semesters"][number];
type Course = Semester["courses"][number];

// Older result records carry no per-course credits; the page has always assumed 4.
const LEGACY_COURSE_CREDITS = 4;
const AMP = /&amp;/g;

const courseName = (course: Course) => course.name.replace(AMP, "&");
const isFail = (course: Course) =>
  course.grade?.trim().toUpperCase() === "F" || course.cgpi === 0;

function getYear(result: ResultTypeWithId): string {
  const n = result.semesters.length;
  if (n <= 1) return "First year";
  if (n <= 3) return "Second year";
  if (n <= 5) return "Third year";
  if (n <= 7) return "Final year";
  if (n === 8) {
    if (result.programme === "B.Tech") return "Pass out";
    if (result.programme === "Dual Degree") return "Final year";
    return "Super final year";
  }
  if (n === 9) return "Super final year";
  if (n === 10) return "Pass out";
  if (result.programme === "Dual Degree") {
    return n < 12 ? "Super final year" : "Pass out";
  }
  return "Unknown year";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rollNo } = await params;
  return {
    title: `${rollNo} | Academic Performance`,
    description: `Detailed academic results and performance analysis for ${rollNo}`,
    alternates: { canonical: `/results/${rollNo}` },
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export default async function ResultsPage(props: Props) {
  const [{ rollNo }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const result = await getResultByRollNo(
    rollNo,
    searchParams?.update === "1",
    searchParams?.new === "1"
  );
  if (!result) return notFound();

  const { semesters } = result;
  const cgpis = semesters.map((s) => s.cgpi);
  const current = semesters.at(-1)?.cgpi ?? 0;
  const previous = semesters.length > 1 ? semesters.at(-2)?.cgpi : undefined;
  const delta = typeof previous === "number" ? current - previous : null;
  const highest = cgpis.length ? Math.max(...cgpis) : 0;
  const lowest = cgpis.length ? Math.min(...cgpis) : 0;

  let totalCourses = 0;
  let backlogs = 0;
  for (const sem of semesters) {
    totalCourses += sem.courses.length;
    for (const course of sem.courses) if (isFail(course)) backlogs++;
  }
  const hasCredits = semesters.some((sem) =>
    sem.courses.every((c) => c.credits !== undefined)
  );

  return (
    <div className="mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pt-6 pb-16 md:px-6">
      <PreviousPageLink
        size="sm"
        variant="ghost"
        className="mb-6 w-fit text-muted-foreground"
      />

      <header className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="hidden size-14 shrink-0 place-items-center rounded-2xl border border-border bg-card font-heading text-heading-sm font-medium text-primary md:grid dark:bg-background"
          >
            {result.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <h1 className="text-balance text-heading-lg font-medium text-foreground">
              {result.name}
            </h1>
            <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-body text-muted-foreground">
              <li className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-foreground">
                {result.rollNo}
              </li>
              <li className="flex items-center gap-1.5">
                <BookOpen className="size-4" aria-hidden="true" />
                {result.branch}
              </li>
              <li className="flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden="true" />
                {getYear(result)}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RankChip rank={result.rank.college} className="h-9 px-3 text-body" />
          <ButtonLink
            href={`mailto:${result.rollNo}${orgConfig.mailSuffix}`}
            variant="outline"
            size="sm"
          >
            <Mail />
            Email student
          </ButtonLink>
        </div>
      </header>

      <section
        aria-label="Summary"
        className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-12"
      >
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-6 md:col-span-4 lg:col-span-3 dark:bg-background">
          <p className="text-body text-muted-foreground">Cumulative GPI</p>
          <p className="flex items-baseline gap-2">
            <span className="font-heading text-display font-medium tabular-nums text-foreground">
              {current.toFixed(2)}
            </span>
            <span className="text-body text-muted-foreground">/ 10</span>
          </p>
          {delta === null ? (
            <p className="text-caption text-muted-foreground">
              First semester on record
            </p>
          ) : (
            <p className="flex items-center gap-2 text-caption text-muted-foreground">
              <TrendDelta delta={delta} />
              vs last semester
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 md:col-span-8 lg:col-span-5 dark:bg-background">
          <p className="text-body text-muted-foreground">Rankings</p>
          <dl className="mt-4 grid grid-cols-3 divide-x divide-border">
            <RankStat label="Batch" rank={result.rank.batch} />
            <RankStat label="Branch" rank={result.rank.branch} />
            <RankStat label="Class" rank={result.rank.class} />
          </dl>
        </div>

        <dl className="flex flex-col justify-center divide-y divide-border rounded-2xl border border-border bg-card px-6 md:col-span-12 lg:col-span-4 dark:bg-background">
          <SummaryRow label="Total courses" value={totalCourses} />
          <SummaryRow label="Highest CGPI" value={highest.toFixed(2)} />
          <SummaryRow label="Lowest CGPI" value={lowest.toFixed(2)} />
          {backlogs > 0 && (
            <SummaryRow
              label={
                <span className="flex items-center gap-1.5 text-destructive">
                  <TriangleAlert className="size-4" aria-hidden="true" />
                  Backlogs
                </span>
              }
              value={backlogs}
              className="text-destructive"
            />
          )}
        </dl>
      </section>

      <AdUnit adSlot="display-horizontal" key="results-header-ad" />

      <Tabs defaultValue="detail" className="mt-10 w-full">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="hidden text-heading-sm font-medium text-foreground sm:block">
            Academic history
          </h2>
          <TabsList>
            <TabsTrigger value="detail" className="gap-1.5">
              <BookOpen className="size-4" aria-hidden="true" />
              Detail
            </TabsTrigger>
            {hasCredits && (
              <TabsTrigger value="transcript" className="gap-1.5">
                <TableIcon className="size-4" aria-hidden="true" />
                Transcript
              </TabsTrigger>
            )}
            <TabsTrigger value="graph" className="gap-1.5">
              <ChartLine className="size-4" aria-hidden="true" />
              Graph
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="detail">
          <AccordionPrimitive.Root
            type="multiple"
            defaultValue={semesters[0] ? [String(semesters[0].semester)] : []}
            className="flex flex-col gap-3"
          >
            {semesters.map((sem) => (
              <SemesterItem key={sem.semester} sem={sem} />
            ))}
          </AccordionPrimitive.Root>
        </TabsContent>

        {hasCredits && (
          <TabsContent value="transcript" className="flex flex-col gap-3">
            {semesters.map((sem) => (
              <TranscriptTable key={sem.semester} sem={sem} />
            ))}
          </TabsContent>
        )}

        <TabsContent
          value="graph"
          className="min-h-100 rounded-2xl border border-border bg-card p-2 sm:p-4 dark:bg-background"
        >
          <CGPIChartLazy semesters={semesters} />
        </TabsContent>
      </Tabs>

      <AdUnit adSlot="display-horizontal" key="results-footer-ad" />
    </div>
  );
}

function RankStat({ label, rank }: { label: string; rank: number }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 text-center">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="font-heading text-heading-sm font-medium tabular-nums text-foreground">
        #{rank}
      </dd>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 text-body">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "font-mono font-medium tabular-nums text-foreground",
          className
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function SemesterItem({ sem }: { sem: Semester }) {
  const credits = sem.courses.reduce(
    (acc, c) => acc + (c.credits || LEGACY_COURSE_CREDITS),
    0
  );
  return (
    <AccordionPrimitive.Item
      value={String(sem.semester)}
      className="overflow-hidden rounded-2xl border border-border bg-card dark:bg-background"
    >
      <AccordionPrimitive.Header asChild>
        <h3>
          <AccordionPrimitive.Trigger className="group flex w-full items-center gap-4 px-4 py-3 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            <span className="flex h-11 min-w-11 flex-col items-center justify-center rounded-lg border border-border px-2">
              <span className="text-caption text-muted-foreground">Sem</span>
              <span className="text-body font-semibold leading-none text-foreground tabular-nums">
                {sem.semester}
              </span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex flex-wrap gap-x-4 text-body">
                <span className="text-muted-foreground">
                  SGPI{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {sem.sgpi}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  CGPI{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {sem.cgpi}
                  </span>
                </span>
              </span>
              <span className="text-caption text-muted-foreground tabular-nums">
                {sem.courses.length} courses · {credits} credits
              </span>
            </span>
            <span
              aria-hidden="true"
              className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block"
            >
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, (sem.sgpi / 10) * 100)}%` }}
              />
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-craft group-data-[state=open]:rotate-180"
            />
          </AccordionPrimitive.Trigger>
        </h3>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden border-t border-border data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <ul className="divide-y divide-border">
          {sem.courses.map((course) => {
            const fail = isFail(course);
            return (
              <li
                key={course.code}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-body font-medium text-foreground">
                    {courseName(course)}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-caption">
                    <span className="rounded-sm bg-muted px-1.5 font-mono text-muted-foreground">
                      {course.code}
                    </span>
                    {course.grade && (
                      <GradeChip grade={course.grade} fail={fail} />
                    )}
                  </p>
                </div>
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border text-body font-medium tabular-nums",
                    fail
                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                      : "border-border text-foreground"
                  )}
                >
                  <span className="sr-only">Grade points </span>
                  {course.cgpi}
                </span>
              </li>
            );
          })}
        </ul>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

function GradeChip({ grade, fail }: { grade: string; fail: boolean }) {
  return (
    <span
      className={cn(
        "rounded-sm border px-1.5 font-semibold",
        fail
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border text-foreground"
      )}
    >
      <span className="sr-only">Grade </span>
      {grade}
      {fail && <span className="sr-only"> (fail)</span>}
    </span>
  );
}

function TranscriptTable({ sem }: { sem: Semester }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card dark:bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-body font-medium text-foreground">
          Semester {sem.semester}
        </h3>
        <span className="text-caption text-muted-foreground tabular-nums">
          SGPI <span className="font-medium text-foreground">{sem.sgpi}</span>
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-body">
          <caption className="sr-only">
            Semester {sem.semester} courses, credits and grades
          </caption>
          <thead>
            <tr className="border-b border-border text-caption text-muted-foreground">
              <th scope="col" className="h-9 px-5 text-left font-medium">
                Code
              </th>
              <th scope="col" className="h-9 px-3 text-left font-medium">
                Subject
              </th>
              <th scope="col" className="h-9 px-3 text-right font-medium">
                Credits
              </th>
              <th scope="col" className="h-9 px-3 text-center font-medium">
                Grade
              </th>
              <th scope="col" className="h-9 px-5 text-right font-medium">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sem.courses.map((course) => (
              <tr key={course.code}>
                <td className="whitespace-nowrap px-5 py-2.5 font-mono text-caption text-muted-foreground">
                  {course.code}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-foreground">
                  {courseName(course)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {course.credits ?? "N/A"}
                </td>
                <td className="px-3 py-2.5 text-center text-caption">
                  {course.grade ? (
                    <GradeChip grade={course.grade} fail={isFail(course)} />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-5 py-2.5 text-right font-mono tabular-nums">
                  {course.sub_points ??
                    (course.credits && course.cgpi
                      ? course.credits * course.cgpi
                      : "N/A")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
