import ResourceCard from "@/components/application/resource-card";
import { ResponsiveContainer } from "@/components/common/container";
import { Icon, IconType } from "@/components/icons";
import { ButtonLink } from "@/components/utils/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus } from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getAllMDXMeta, ResourceType } from "~/lib/markdown/mdx";
import { appConfig } from "~/project.config";
import { changeCase } from "~/utils/string";

type PageProps = {
  params: Promise<{ type: ResourceType }>;
};

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const types = await getAllMDXMeta(resolvedParams.type);
  if (!types.length) notFound();

  const parentMeta = await parent;
  const title = ` ${changeCase(resolvedParams.type, "title")} `;
  const description = ` Explore our collection of ${resolvedParams.type} by browsing through the resources`;
  const resourceUrl = `${appConfig.url}/resources/${resolvedParams.type}`;
  return {
    title,
    description,
    alternates: {
      canonical: resourceUrl,
    },
  };
}
export default async function ResourceList({ params }: PageProps) {
  const resolvedParams = await params;
  const resources = await getAllMDXMeta(resolvedParams.type);
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div
        className={cn(
          "w-full flex items-center flex-wrap p-4 py-2 mt-2 mb-4 gap-2 bg-card rounded-lg border"
        )}
      >
        <Icon
          name={resolvedParams.type as IconType}
          className="inline-block size-5 mr-2"
        />
        <div>
          <h3 className="text-sm font-semibold capitalize">
            {resolvedParams.type}
          </h3>
          <p className="text-muted-foreground text-xs">
            Explore our collection of {resolvedParams.type} by browsing through
            the resources below.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 sm:ml-auto">
          <ButtonLink
            href={`https://github.com/${appConfig.githubUri}/new/main/apps/platform/resources?filename=${resolvedParams.type}/example.mdx`}
            target="_blank"
            rel="noopener noreferrer"
            variant="rainbow_outline"
            rounded="full"
            size="sm"
            aria-label={`Write ${changeCase(resolvedParams.type, "title")} resource`}
          >
            <Plus />
            Write Your {changeCase(resolvedParams.type, "title")}
          </ButtonLink>
          <ButtonLink href="/resources" variant="ghost" size="sm">
            View All
            <ArrowRight />
          </ButtonLink>
        </div>
      </div>
      <ResponsiveContainer className="px-3 pr-4 lg:px-6 @md:grid-cols-1 @5xl:grid-cols-3">
        {resources.map((frontmatter) => {
          return (
            <ResourceCard
              key={frontmatter.slug}
              {...frontmatter}
              type={frontmatter.type}
              title={frontmatter.title}
              slug={frontmatter.slug}
              summary={frontmatter.summary}
              tags={frontmatter.tags}
              coverImage={frontmatter.coverImage}
              date={frontmatter.date}
              readingTime={frontmatter.readingTime}
              category={frontmatter.category}
            />
          );
        })}
      </ResponsiveContainer>
    </div>
  );
}
