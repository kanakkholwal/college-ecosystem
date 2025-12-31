import { ResultCard, SkeletonCard } from "@/components/application/result-card";
import Pagination from "@/components/application/result-pagination";
import SearchBox from "@/components/application/result-search";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { BiSpreadsheet } from "react-icons/bi";
import { getResults } from "~/actions/common.result";

import { BaseHeroSection } from "@/components/application/base-hero";
import AdUnit from "@/components/common/adsense";
import EmptyArea from "@/components/common/empty-area";
import { NoteSeparator } from "@/components/common/note-separator";
import ConditionalRender from "@/components/utils/conditional-render";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import type { Metadata } from "next";
import { type SearchParams } from 'nuqs/server';
import { appConfig, orgConfig } from "~/project.config";
import { searchParamsCache } from "./utils";


async function ResultDisplay({ searchParams }: {
  searchParams: Promise<SearchParams>;
}) {
  const { query, page, batch, branch, programme, cache, freshers } = await searchParamsCache.parse(searchParams)

  const currentPage = Number(page) || 1;
  const filter = {
    batch: batch,
    branch: branch || "",
    programme: programme || "",
    include_freshers: freshers === "1",
  };
  const new_cache = cache === "new";

  const resData = await getResults(query, currentPage, filter, new_cache);
  const { results, totalPages } = resData;
  console.log("Results fetched:", results.length, "Total Pages:", totalPages);
  return <>
    <NoteSeparator label={`${results.length} Results found`} />

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
  </>
}

export default async function ResultPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;


  return (
    <div className="px-4 md:px-12 xl:px-6 @container">
      <BaseHeroSection
        title={`${orgConfig.shortName} Semester Results Portal`}
        description="Access official exam results for National Institute of Technology Hamirpur. Check grades,
and track academic performance"
      >
        <Suspense
          key={"key_search_bar"}
          fallback={<Skeleton className="h-12 w-full " />}
        >
          <SearchBox new_cache={searchParams?.cache === "new"} />
        </Suspense>
        <script type="application/ld+json" id="search-results-json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            name: "NITH Results Portal",
            description: "Official examination results portal for NIT Hamirpur",
            url: `${appConfig.url}/results`,
            publisher: orgConfig.jsonLds.EducationalOrganization,
          })}
        </script>
      </BaseHeroSection>

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
        <ResultDisplay searchParams={props.searchParams} />

      </ErrorBoundaryWithSuspense>

      <AdUnit
        adSlot="multiplex"
        key={"results-page-ad"}
      />
    </div>
  );
}


export const metadata: Metadata = {
  title:
    orgConfig.shortName + " Results Portal - Check Semester Results Online",
  description:
    orgConfig.shortName +
    " result portal. Search semester results by roll number, name, or course. Access academic records, grades, and transcripts for all programs.",
  applicationName: orgConfig.shortName + " Result Portal",
  alternates: {
    canonical: "/results",
  },
  keywords: [
    orgConfig.shortName,
    orgConfig.name,
    // Primary Keywords
    "NITH Results",
    "NITH Result Portal",
    "NITH Semester Results",
    "NITH Exam Results",

    // Program-Specific
    "NITH BTech Results",
    "NITH MTech Results",
    "NITH BArch Results",
    "NITH MCA Results",
    "NITH PhD Results",

    // Search Functionality
    "Check NITH Results",
    "NITH Result by Roll Number",
    "NITH Result by Name",
    "NITH Result Search",

    // Location-Based
    "NITH Hamirpur Results",
    "NIT Hamirpur Results",

    // Academic Terms
    "NITH Grade Card",
    "NITH Academic Records",
    "NITH Transcript",

    // Technical Terms
    "NITH Result 2024",
    "NITH Odd Semester Results",
    "NITH Even Semester Results",
  ],
  openGraph: {
    title: `NITH Results Portal | ${orgConfig.shortName}`,
    description:
      "Access exam results, grade cards and academic records for all programs at NIT Hamirpur",
    url: `${appConfig.url}/results`,
    images: [
      {
        url: new URL("/og-results.jpg", appConfig.url).toString(),
        width: 1200,
        height: 630,
        alt: "NITH Results Portal Interface",
      },
    ],

    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Check NITH Results Online | ${orgConfig.shortName}`,
    description:
      "Instant access to semester exam results for NIT Hamirpur students",
    images: [new URL("/logo.png", appConfig.url).toString()],
  },
  // robots: {
  //     index: true,
  //     follow: true,
  //     nocache: true,
  //     googleBot: {
  //       index: true,
  //       follow: true,
  //     }
  //   },
};