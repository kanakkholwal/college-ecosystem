import { BaseHeroSection } from "@/components/application/base-hero";
import { SkeletonCard } from "@/components/application/result-card";
import { Skeleton } from "@/components/ui/skeleton";
import { orgConfig } from "~/project.config";

export default function LoadingResultPage() {
  return (
    <>
      <BaseHeroSection
        title={
          <>
            {orgConfig.shortName} <span className="text-primary">Result</span>{" "}
            Portal
          </>
        }
        description="Search for results by entering your roll number or name."
      >
        <Skeleton className="h-12 w-full " />
      </BaseHeroSection>

      <div className="mx-auto max-w-7xl w-full xl:px-6 grid gap-4 grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 @5xl:grid-cols-4">
        {[...Array(6)].map((_, i) => {
          return <SkeletonCard key={i.toString()} />;
        })}
      </div>
    </>
  );
}
