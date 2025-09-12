
import AdUnit from "@/components/common/adsense";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviousPageLink } from "@/components/utils/link";
import { ArrowDownUp, Mail } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
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

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { rollNo } = await params;
  return {
    title: `${rollNo} | Results`,
    description: `Check the results of ${rollNo}`,
    alternates: { canonical: "/results/" + rollNo },
  };
}

export default async function ResultsPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const update_result = searchParams?.update === "true";
  const is_new = searchParams?.new === "true";
  const result = await getResultByRollNo(params.rollNo, update_result, is_new);

  if (!result) return notFound();

  const maxCgpi = Math.max(...result.semesters.map((s) => s.cgpi));
  const minCgpi = Math.min(...result.semesters.map((s) => s.cgpi));
  const cgpi = result.semesters.at(-1)?.cgpi ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
      {/* Header Section */}
      <section
        id="hero"
        className="w-full py-10 flex flex-col gap-6 lg:gap-10 relative"
      >
        <div>
          <PreviousPageLink size="sm" variant="ghost" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Info */}
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-4xl lg:text-5xl tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {result.name}
              </span>
            </h1>
            <h5 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
              {result.rollNo}
              <Link
                href={`mailto:${result.rollNo}${orgConfig.mailSuffix}`}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Contact via mail"
              >
                <Mail className="w-5 h-5" />
              </Link>
            </h5>

            <div className="flex flex-wrap items-center gap-2">
              <Badge>{getYear(result)}</Badge>
              <Badge>{result.branch}</Badge>
              <Badge>{result.programme}</Badge>
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
            <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
              <ArrowDownUp className="size-5" />
              Performance Snapshot
            </h4>
            <div className="grid grid-cols-3 gap-y-6 text-center">
              <Stat label="Max CGPI" value={maxCgpi} />
              <Stat label="Current CGPI" value={cgpi} />
              <Stat label="Min CGPI" value={minCgpi} />
              <Stat label="Batch Rank" value={result.rank.batch} />
              <Stat label="Branch Rank" value={result.rank.branch} />
              <Stat label="Class Rank" value={result.rank.class} />
            </div>
          </div>
        </div>

        <AdUnit
          adSlot="display-horizontal"
          key={"results-page-ad-header-" + result.rollNo}
        />
      </section>

      {/* Semester Results */}
      <section className="mt-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
          Semester-wise Results
        </h2>

        <Tabs defaultValue="table" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="table">Tabular View</TabsTrigger>
              <TabsTrigger value="graph">Graphical View</TabsTrigger>
            </TabsList>
          </div>

          {/* Table View */}
          <TabsContent value="table">
            <Accordion
              type="single"
              collapsible
              defaultValue={result.semesters?.[0]?.semester.toString()}
              className="grid gap-4"
            >
              {result.semesters?.map((semester) => (
                <AccordionItem
                  value={semester.semester.toString()}
                  key={semester.semester}
                  className="bg-card border border-border/40 rounded-xl p-4"
                >
                  <AccordionTrigger className="flex justify-between flex-wrap gap-4 ">
                    <h4 className="text-base font-semibold">
                      Semester {semester.semester}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap mr-4">
                      <span>CGPI: {semester.cgpi}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>SGPI: {semester.sgpi}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{semester.courses.length} Courses</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>
                        Credits: {semester.sgpi_total}/{semester.cgpi_total}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="mt-4 space-y-3">
                    {semester.courses.map((course) => (
                      <div
                        key={course.code}
                        className="flex justify-between items-center py-2 px-3 rounded-lg border border-border/40 hover:bg-muted/40 transition"
                      >
                        <div>
                          <h4 className="text-sm font-medium">
                            {course.name.replaceAll("&amp;", "&")}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {course.code}
                          </p>
                        </div>
                        <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {course.cgpi}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* Graph View */}
          <TabsContent value="graph">
              <CGPIChart semesters={result.semesters} />
          </TabsContent>
        </Tabs>
      </section>

      <AdUnit
        adSlot="display-horizontal"
        key={"results-page-ad-footer-" + result.rollNo}
      />
    </div>
  );
}

/* Small stat card */
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
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
        ? "Pass Out"
        : "Super Final Year (Dual Degree)";
    case 9:
      return "Super Final Year (Dual Degree)";
    case 10:
      return "Pass Out";
    default:
      return "Unknown Year";
  }
}
