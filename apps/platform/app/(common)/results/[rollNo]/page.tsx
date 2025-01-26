import { GoBackButton } from "@/components/common/go-back";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ResultTypeWithId, Semester } from "src/models/result";
import { getResultByRollNo } from "~/actions/result";
import { CgpiCard, RankCard, SemCard } from "./components/card";
import { CGPIChart } from "./components/chart";
import { ORG_DOMAIN } from "~/project.config";

import type { Metadata, ResolvingMetadata } from "next";

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

  return (
    <>
      <div>
        <GoBackButton />
      </div>
      <section
        id="hero"
        className="z-10 w-full max-w-6xl relative flex flex-col items-center justify-center  py-24 text-center"
      >
        <div className="lg:w-3/4 text-center mx-auto mt-10">
          <h1 className="text-gray-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">
            <span className="relative bg-linear-to-r from-primary to-sky-500 bg-clip-text text-transparent  md:px-2">
              {result.name}
            </span>
          </h1>
          <h5 className="mt-8 text-xl font-semibold text-gray-700 dark:text-gray-300 text-center mx-auto uppercase">
            {result.rollNo}
            <Link
              href={`mailto:${result.rollNo}@${ORG_DOMAIN}`}
              className="inline-block text-primary hover:text-primaryLight ease-in duration-300 align-middle ml-2 -mt-1"
              title={"Contact via mail"}
            >
              <Mail className="w-5 h-5" />
            </Link>
          </h5>
          <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6">
            <div className="w-full flex flex-wrap items-center gap-4 text-sm mx-auto justify-center">
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
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-6 md:px-12 xl:px-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
        <RankCard result={result} />
        <CgpiCard result={result} />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mx-auto mt-24 mb-10">
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
            <div className="max-w-7xl w-full xl:px-6 grid gap-4 grid-cols-1 @lg:grid-cols-2 @4xl:grid-cols-3">
              {result.semesters?.map((semester: Semester) => {
                return <SemCard key={semester.semester} semester={semester} />;
              })}
            </div>
          </TabsContent>
          <TabsContent value="graph">
            <div className="max-w-6xl mx-auto my-5 w-full p-4 rounded-xl bg-white/50">
              <CGPIChart semesters={result.semesters} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
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
