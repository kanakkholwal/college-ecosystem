import { GoBackButton } from "@/components/common/go-back";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownUp, Mail } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ResultTypeWithId, Semester } from "src/models/result";
import { getResultByRollNo } from "~/actions/result";
import { ORG_DOMAIN } from "~/project.config";
import { Course } from "~/types/result";
import { CGPIChart } from "./components/chart";

type Props = {
  params: Promise<{ rollNo: string }>;
  searchParams?: Promise<{
    update?: string;
    new?: string;
  }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const { rollNo } = await params;
  return {
    title: `${rollNo} | Results | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
    description: `Check the results of ${rollNo}`,
  };
}

export default async function ResultsPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const update_result = searchParams?.update === "true";
  const is_new = searchParams?.new === "true";
  const result = await getResultByRollNo(params.rollNo, update_result, is_new);
  if (!result) {
    return notFound();
  }

  const maxCgpi = result.semesters?.reduce(
    (prev, curr) => Math.max(prev, curr.cgpi),
    0
  );
  const minCgpi = result.semesters?.reduce(
    (prev, curr) => Math.min(prev, curr.cgpi),
    10
  );
  const cgpi = result.semesters?.at(-1)?.cgpi ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 xl:px-6 ">
      <section
        id="hero"
        className="z-10 w-full max-w-7xl relative flex flex-col gap-5 py-10 px-4 rounded-lg text-center lg:text-left"
      >
        <div>
          <GoBackButton size="sm" />
        </div>
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <h1 className="font-bold text-3xl lg:text-5xl">
              <span className="relative bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent  md:px-2">
                {result.name}
              </span>
            </h1>
            <h5 className="text-lg ml-4 font-semibold text-muted-foreground uppercase">
              {result.rollNo}
              <Link
                href={`mailto:${result.rollNo}@${ORG_DOMAIN}`}
                className="inline-block text-primary hover:text-primaryLight ease-in duration-300 align-middle ml-2 -mt-1"
                title={"Contact via mail"}
              >
                <Mail className="w-5 h-5" />
              </Link>
            </h5>
            <div className="w-full flex flex-wrap items-center gap-4 text-sm mx-auto md:ml-0">
              <span
                className={"bg-primary/10 text-primary py-1.5 px-3 rounded-md"}
              >
                {getYear(result)}
              </span>
              <span
                className={"bg-primary/10 text-primary py-1.5 px-3 rounded-md"}
              >
                {result.branch}
              </span>
              <span
                className={"bg-primary/10 text-primary py-1.5 px-3 rounded-md"}
              >
                {result.programme}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-card rounded-lg space-y-4">
              <h4 className="text-base font-medium">
                <ArrowDownUp className="inline-block size-5 mr-2" />
                Performance Analysis
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center px-3">
                <div>
                  <p className="text-xs  text-muted-foreground">Max. CGPI</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {maxCgpi}
                  </p>
                </div>
                <div>
                  <p className="text-xs  text-muted-foreground">Cgpi</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {cgpi}
                  </p>
                </div>
                <div>
                  <p className="text-xs  text-muted-foreground">Min. Cgpi</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {minCgpi}
                  </p>
                </div>

                <div>
                  <p className="text-xs  text-muted-foreground">Batch Rank</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {result.rank.batch}
                  </p>
                </div>
                <div>
                  <p className="text-xs  text-muted-foreground">Branch Rank</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {result.rank.branch}
                  </p>
                </div>
                <div>
                  <p className="text-xs  text-muted-foreground">Class Rank</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {result.rank.class}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      <div>
        <h2 className="text-3xl font-bold text-center mx-auto my-10">
          Semester Wise Results
        </h2>

        <Tabs defaultValue="table">
          <div className="flex items-center w-full mb-5">
            <TabsList className="mx-auto">
              <TabsTrigger value="table">Tabular View</TabsTrigger>
              <TabsTrigger value="graph">Graphical View</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="table">


            <Accordion type="single" collapsible className="w-full relative grid gap-4">

              {result.semesters?.map((semester: Semester) => {
                return <AccordionItem value={semester.semester.toString()} key={semester.semester} className="bg-card p-3 rounded-lg">
                  <AccordionTrigger className="space-y-1 no-underline hover:no-underline items-center justify-between flex-wrap align-middle gap-3">
                    <h4 className="text-base font-semibold leading-none align-middle"> Semester {semester.semester}</h4>
                    <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground align-middle mr-4">
                      <div>CGPI : {semester.cgpi}</div>
                      <Separator orientation="vertical" className="h-5" />
                      <div>SGPI : {semester.sgpi}</div>
                      <Separator orientation="vertical" className="h-5"/>
                      <div>{semester.courses.length} Courses</div>
                      <Separator orientation="vertical"className="h-5" />
                      <div>
                        Sem/Total Credit : {semester.sgpi_total}/ {semester.cgpi_total}
                      </div>
                    </div>

                  </AccordionTrigger>
                  <AccordionContent className="ms-6 mr-4">
                    <Separator className="my-4" />
                    {semester.courses?.map((course: Course, index) => {
                      return (
                        <div
                          className="flex justify-between items-center py-2 gap-2 border-b border-border last:border-b-0"
                          key={course.code}
                        >
                          <div className="flex items-start flex-col">
                            <h4 className="text-sm tracking-wide font-semibold">
                              {course.name.replaceAll("&amp;", "&")}
                            </h4>
                            <p className="text-xs text-muted-foreground">{course.code}</p>
                          </div>
                          <div className="text-primary text-sm bg-primary/20 dark:bg-primary/10 p-3 rounded-full h-6 w-6 flex justify-center items-center">
                            {course.cgpi}
                          </div>
                        </div>
                      );
                    })}
                  </AccordionContent>

                </AccordionItem>;
              })}
            </Accordion>

          </TabsContent>
          <TabsContent value="graph">
            <div className="max-w-4xl mx-auto my-5 w-full p-4 rounded-xl bg-accent">
              <CGPIChart semesters={result.semesters} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
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
