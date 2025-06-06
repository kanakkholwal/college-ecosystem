import { ResultCard, SkeletonCard } from "@/components/application/result-card";
import Pagination from "@/components/application/result-pagination";
import SearchBox from "@/components/application/result-search";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { BiSpreadsheet } from "react-icons/bi";
import { getCachedLabels, getResults } from "~/actions/result";

import EmptyArea from "@/components/common/empty-area";
import { NoteSeparator } from "@/components/common/note-separator";
import ConditionalRender from "@/components/utils/conditional-render";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import type { Metadata } from "next";
import { orgConfig } from "~/project.config";

export const metadata: Metadata = {
  title: `Results`,
  description: "Check your results here.",
};

export default async function ResultPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    batch?: string;
    branch?: string;
    programme?: string;
    cache?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query?.trim() || "";
  const currentPage = Number(searchParams?.page) || 1;
  const filter = {
    batch: Number(searchParams?.batch),
    branch: searchParams?.branch || "",
    programme: searchParams?.programme || "",
  };
  const new_cache = searchParams?.cache === "new";

  const { results, totalPages } = await getResults(
    query,
    currentPage,
    filter,
    new_cache
  );
  const { branches, programmes, batches } = await getCachedLabels(new_cache);

  return (
    <div className="px-4 md:px-12 xl:px-6 @container">
      <section
        id="hero"
        className="z-10 w-full max-w-6xl mx-auto  relative flex flex-col items-center justify-center  py-24 max-h-80 text-center"
      >
        <h2 className="text-3xl font-semibold text-center whitespace-nowrap">
          {orgConfig.shortName}
          <span className="relative bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-primaryLight dark:to-secondaryLight md:px-2">
            Result
          </span>
          Portal
        </h2>
        <p className="mt-4 mb-8 text-lg text-muted-foreground">
          {orgConfig.shortName} Portal is a platform for students of{" "}
          {orgConfig.shortName} to get all the resources at one place.
        </p>
        <div
          className="mt-10 flex flex-wrap justify-center gap-y-4 gap-x-6 w-full mx-auto max-w-2xl"
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
      <NoteSeparator label={`${results.length} Results found`} />
      <ErrorBoundaryWithSuspense
        fallback={
          <EmptyArea
            icons={[BiSpreadsheet]}
            title="Failed to load results"
            description="An error occurred while fetching the results. Please try again later."
          />
        }
        loadingFallback={
          <div className="mx-auto max-w-7xl w-full grid gap-4 grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 @5xl:grid-cols-4">
            {[...Array(6)].map((_, i) => {
              return <SkeletonCard key={i.toString()} />;
            })}
          </div>
        }
      >
        <ConditionalRender condition={results.length > 0}>
          <div className="mx-auto max-w-7xl w-full xl:px-6 grid gap-3 grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 @5xl:grid-cols-4">
            {results.map((result, i) => {
              return (
                <ResultCard
                  key={result._id.toString()}
                  result={result}
                  style={{
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              );
            })}
          </div>
          <div className="max-w-7xl mx-auto p-4 empty:hidden">
            <Suspense
              key={"Pagination_key"}
              fallback={<Skeleton className="h-12 w-full " />}
            >
              <Pagination totalPages={totalPages} />
            </Suspense>
          </div>
        </ConditionalRender>
        <ConditionalRender condition={results.length === 0}>
          <EmptyArea
            icons={[BiSpreadsheet]}
            title="No Results Found"
            description="Try adjusting your search filters."
          />
        </ConditionalRender>
      </ErrorBoundaryWithSuspense>
    </div>
  );
}
