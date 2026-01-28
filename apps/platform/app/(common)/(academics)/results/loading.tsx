import { BaseHeroSection } from "@/components/application/base-hero";
import { SkeletonCard } from "@/components/application/result/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orgConfig } from "~/project.config";

export default function LoadingResultPage() {
  return (
    <>
      <BaseHeroSection
        title={`${orgConfig.shortName} Semester Results Portal`}
        description="Access official exam results for National Institute of Technology Hamirpur. Check grades,
and track academic performance" >
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
