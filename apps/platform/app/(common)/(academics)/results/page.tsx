import { ResultCard, SkeletonCard } from "@/components/application/result/card";
import {
  pickQuickFilters,
  QuickFilters,
} from "@/components/application/result/hero";
import Pagination from "@/components/application/result/pagination";
import SearchBox from "@/components/application/result/search";
import AdUnit from "@/components/common/adsense";
import { TiltedChip } from "@/components/site/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundaryWithSuspense } from "@/components/utils/error-boundary";
import { SearchX, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { getCachedLabels, getResults } from "~/actions/common.result";
import { appConfig, orgConfig } from "~/project.config";
import { searchParamsCache } from "./utils";

type ParsedParams = Awaited<ReturnType<typeof searchParamsCache.parse>>;

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SearchResultsPage",
  name: `${orgConfig.shortName} Results Portal`,
  description: `Semester results for ${orgConfig.name}`,
  url: `${appConfig.url}/results`,
  publisher: orgConfig.jsonLds.EducationalOrganization,
});

export default async function ResultPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParamsCache.parse(props.searchParams);
  const freshCache = params.cache === "new";

  return (
    <div className="@container mx-auto flex w-full max-w-(--max-app-width) flex-col px-4 pb-12 md:px-6">
      <script
        type="application/ld+json"
        id="search-results-json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD; text children would be HTML-escaped
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <header className="mx-auto flex w-full max-w-3xl flex-col items-center py-12 text-center sm:py-16">
        <TiltedChip>
          <span className="text-primary">Every semester</span>, every branch
        </TiltedChip>
        <h1 className="mt-4 text-balance text-heading-lg font-medium text-foreground md:text-display">
          Find a semester
          <br />
          <span className="text-primary">result</span>
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">
          Search by roll number or name, then narrow it down by branch, batch or
          programme.
        </p>

        <div className="mt-8 flex w-full flex-col gap-4 rounded-3xl border border-border bg-card/85 p-2 backdrop-blur-xl dark:bg-background/85">
          <Suspense fallback={<Skeleton className="h-14 w-full rounded-2xl" />}>
            <SearchWithLabels freshCache={freshCache} />
          </Suspense>
        </div>
      </header>

      <ErrorBoundaryWithSuspense
        fallback={
          <EmptyState
            icon={<TriangleAlert className="size-6" aria-hidden="true" />}
            title="Results couldn't load"
            description="The results service didn't respond. Refresh the page, or try again in a minute."
          />
        }
        loadingFallback={<ResultsGridSkeleton />}
      >
        <ResultDisplay params={params} />
      </ErrorBoundaryWithSuspense>

      <AdUnit adSlot="multiplex" key="results-page-ad" />
    </div>
  );
}

async function SearchWithLabels({ freshCache }: { freshCache: boolean }) {
  const { branches, batches, programmes } = await getCachedLabels(freshCache);
  return (
    <>
      <SearchBox
        branches={branches}
        batches={batches}
        programmes={programmes}
      />
      <div className="px-2 pb-2">
        <QuickFilters filters={pickQuickFilters(batches, programmes)} />
      </div>
    </>
  );
}

async function ResultDisplay({ params }: { params: ParsedParams }) {
  const { query, page, batch, branch, programme, cache, freshers } = params;
  const currentPage = Number(page) || 1;

  const { results, totalPages, totalCount } = await getResults(
    query,
    currentPage,
    {
      batch,
      branch: branch || "",
      programme: programme || "",
      include_freshers: freshers === "1",
    },
    cache === "new"
  );

  if (results.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="size-6" aria-hidden="true" />}
        title="No results match"
        description="Check the roll number, or clear a filter to widen the search."
      />
    );
  }

  return (
    <section aria-labelledby="results-count" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2
          id="results-count"
          className="text-body-lg font-medium text-foreground"
        >
          {totalCount.toLocaleString("en-IN")}{" "}
          {totalCount === 1 ? "student" : "students"}
        </h2>
        <p className="text-caption text-muted-foreground tabular-nums">
          Page {Math.min(currentPage, totalPages)} of {totalPages}
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
        {results.map((result) => (
          <li key={result._id.toString()}>
            <ResultCard result={result} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Suspense fallback={<Skeleton className="h-10 w-64" />}>
            <Pagination totalPages={totalPages} />
          </Suspense>
        </div>
      )}
    </section>
  );
}

function ResultsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <SkeletonCard key={`skeleton-${i.toString()}`} />
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-xl border border-border bg-card text-foreground">
        {icon}
      </span>
      <h2 className="mt-4 text-body-lg font-medium text-foreground">{title}</h2>
      <p className="mt-1 text-body text-muted-foreground">{description}</p>
    </div>
  );
}

export const metadata: Metadata = {
  title: `${orgConfig.shortName} Results Portal - Check Semester Results Online`,
  description: `${orgConfig.shortName} result portal. Search semester results by roll number, name, or course. Access academic records, grades, and transcripts for all programs.`,
  applicationName: `${orgConfig.shortName} Result Portal`,
  alternates: { canonical: "/results" },
  keywords: [
    orgConfig.shortName,
    orgConfig.name,
    "NITH Results",
    "NITH Result Portal",
    "NITH Semester Results",
    "NITH Exam Results",
    "NITH BTech Results",
    "NITH MTech Results",
    "NITH BArch Results",
    "NITH MCA Results",
    "NITH PhD Results",
    "Check NITH Results",
    "NITH Result by Roll Number",
    "NITH Result by Name",
    "NITH Result Search",
    "NITH Hamirpur Results",
    "NIT Hamirpur Results",
    "NITH Grade Card",
    "NITH Academic Records",
    "NITH Transcript",
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
};
