import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownUp, TrendingUp, Undo2 } from "lucide-react";
import Link from "next/link";

export default function Loading() {
  return (
    <>
      <div className="relative mb-24" id="home">
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
        >
          <div className="blur-[106px] h-56 bg-linear-to-br from-primary to-purple-400 dark:from-blue-700" />
          <div className="blur-[106px] h-32 bg-linear-to-r from-cyan-400 to-sky-300 dark:to-indigo-600" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-6">
          <div className="relative pt-24 ml-auto">
            <Link
              href="/results"
              className="relative flex h-12 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-linear-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-gray-700 dark:before:bg-gray-800 sm:w-max"
            >
              <span className="relative text-base font-semibold text-primary dark:text-white flex items-center gap-2">
                <Undo2 className="w-5 h-5" />
                Go Back
              </span>
            </Link>
            <div className="lg:w-3/4 text-center mx-auto mt-10 flex flex-col items-center">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-3 w-10 mx-auto mt-8 " />
              <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6">
                <div className="w-full flex flex-wrap items-center gap-4 text-sm mx-auto justify-center">
                  <Skeleton className={"py-1.5 px-3 rounded-md"} />
                  <Skeleton className={"py-1.5 px-3 rounded-md"} />
                  <Skeleton className={"py-1.5 px-3 rounded-md"} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 md:px-12 xl:px-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <RankCardLoader />
        <CgpiCardLoader />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mx-auto mt-24 mb-10">
          Semester Wise Results
        </h2>
        <div className="max-w-6xl mx-auto px-6 md:px-12 xl:px-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => {
            return <SemCardLoader key={index.toString()} />;
          })}
        </div>
      </div>
    </>
  );
}

function RankCardLoader() {
  return (
    <Card className="hover:shadow-lg animate-in popup ">
      <CardHeader className="flex-row items-center gap-2">
        <div className="flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 dark:bg-gray-800 font-bold text-xl">
          <ArrowDownUp />
        </div>
        <div>
          <CardTitle>Ranking</CardTitle>
          <CardDescription>Ranking Analysis</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex justify-around items-stretch gap-3 text-center">
        <div>
          <Skeleton className="w-20 h-4 mb-1" />
          <Skeleton className="w-20 h-6" />
        </div>
        <div>
          <Skeleton className="w-20 h-4 mb-1" />
          <Skeleton className="w-20 h-6" />
        </div>
        <div>
          <Skeleton className="w-20 h-4 mb-1" />
          <Skeleton className="w-20 h-6" />
        </div>
        <div>
          <Skeleton className="w-20 h-4 mb-1" />
          <Skeleton className="w-20 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}
function CgpiCardLoader() {
  return (
    <Card className="hover:shadow-lg animate-in popup ">
      <CardHeader className="flex-row items-center gap-2">
        <div className="flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 dark:bg-gray-800 font-bold text-xl">
          <TrendingUp />
        </div>
        <div>
          <CardTitle>CGPI</CardTitle>
          <CardDescription>Trend Analysis</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex justify-around items-stretch gap-3 text-center">
        <div>
          <Skeleton className="w-20 h-4 mb-1" />
          <Skeleton className="w-20 h-6" />
        </div>
        <div>
          <Skeleton className="w-20 h-4 mb-1" />
          <Skeleton className="w-20 h-6" />
        </div>
        <div>
          <Skeleton className="w-20 h-4 mb-1" />
          <Skeleton className="w-20 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}
function SemCardLoader() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* ... Semester header content ... */}
      <div className="p-4 flex flex-col">
        {Array.from({
          length: 6,
        })?.map((_, index) => (
          <div
            className="flex justify-between items-center py-2 gap-2 border-b border-border last:border-b-0"
            key={index.toString()}
          >
            <div className="flex items-start flex-col">
              <Skeleton className="w-40 h-6 mb-1" />
              <Skeleton className="w-20 h-4" />
            </div>
            <Skeleton className="w-6 h-6" />
          </div>
        ))}
      </div>
    </div>
  );
}
