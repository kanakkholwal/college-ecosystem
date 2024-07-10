import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { getResults } from "./action";
import { ResultCard, SkeletonCard } from "./components/card";
import Pagination from "./components/pagination";
import SearchBox from "./components/search";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Results | ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`,
  description: `Check your results here.`,
};

export default async function ResultPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    batch?: string;
    branch?: string;
    programme?: string;
  };
}) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const filter = {
    batch: Number(searchParams?.batch),
    branch: searchParams?.branch || "",
    programme: searchParams?.programme || "",
  };

  const { results, totalPages, branches, programmes, batches } =
    await getResults(query, currentPage, filter);

  return (
    <>
      <section
        id="hero"
        className="z-10 w-full max-w-6xl relative flex flex-col items-center justify-center  py-24 max-h-80 text-center"
      >
        <h2
          className="text-2xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap"
          data-aos="fade-up"
        >
          NITH{" "}
          <span className="relative bg-gradient-to-r from-primary to-violet-200 bg-clip-text text-transparent dark:from-primaryLight dark:to-secondaryLight md:px-2">
            Result
          </span>
          Portal
        </h2>
        <p
          className="mt-4 text-neutral-700 dark:text-neutral-300"
          data-aos="zoom-in"
        >
          NITH Portal is a platform for students of NITH to get all the
          resources at one place.
        </p>
        <div
          className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6 w-full mx-auto max-w-2xl"
          data-aos="fade-up"
          data-aos-anchor-placement="center-bottom"
        >
          <Suspense
            key={"key_search_bar"}
            fallback={<Skeleton className="h-12 w-full " />}
          >
            <SearchBox
              branches={branches}
              programmes={programmes}
              batches={batches}
            />
          </Suspense>
        </div>
      </section>
      <div className="max-w-7xl w-full xl:px-6 grid gap-4 grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 @5xl:grid-cols-4">
        <Suspense
          key={"results_key"}
          fallback={
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          }
        >
          {results.map((result, i) => {
            return (
              <ResultCard
                key={i}
                result={result}
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              />
            );
          })}
        </Suspense>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-6">
        <Suspense
          key={"Pagination_key"}
          fallback={
            <>
              <Skeleton className="h-12 w-full " />
            </>
          }
        >
          <Pagination totalPages={totalPages} />
        </Suspense>
      </div>
    </>
  );
}
