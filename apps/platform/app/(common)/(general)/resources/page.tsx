import { BaseHeroSection } from "@/components/application/base-hero";
import BaseSearchBox from "@/components/application/base-search";
import { ButtonLink } from "@/components/utils/link";
import { ArrowUpRight, Plus, RssIcon } from "lucide-react";
import { Metadata } from "next";
import { getAllResources } from "~/lib/markdown/mdx";
import { appConfig } from "~/project.config";
import { CategoryFilter, ResourcesList } from "./client";

// Site constants (should match those in your blog post page)

export const metadata: Metadata = {
  title: "Resources ",
  description:
    "Explore our comprehensive collection of articles, experiences, and case studies.",
  alternates: {
    canonical: "/resources",
  },
  openGraph: {
    title: "Resources  ",
    description:
      "Explore our comprehensive collection of articles, experiences, and case studies.",
    url: `${appConfig.url}/resources`,
    type: "website",
    siteName: appConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Resources ",
    description:
      "Explore our comprehensive collection of articles, experiences, and case studies.",
    creator: appConfig.socials.twitter,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
};

export default async function Page() {
  const resources = await getAllResources();

  // Structured data for CollectionPage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Resources",
    description:
      "Explore our comprehensive collection of articles, experiences, and case studies.",
    url: `${appConfig.url}/resources`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: resources.map((resource, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": resource.type === "articles" ? "Article" : "CreativeWork",
          name: resource.title,
          url: `${appConfig.url}/resources/${resource.type}/${resource.slug}`,
          description: resource.summary,
          datePublished: new Date(resource.date).toISOString(),
          image: resource.coverImage
            ? {
                "@type": "ImageObject",
                url: resource.coverImage,
              }
            : undefined,
          articleSection: resource.category,
          keywords: resource.tags?.join(", ") || "",
        },
      })),
    },
  };
  const allCategories = [...new Set(resources.map((r) => r.type))] as string[];
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <BaseHeroSection
        title="Resources"
        description="Explore our comprehensive collection of articles, experiences, and case studies."
      >
        <BaseSearchBox
          searchPlaceholder="Search resources..."
          className="max-w-2xl mx-auto mb-4"
          filterDialogTitle="Filter Resources"
          filterDialogDescription="Filter resources by type, category, or tags to find exactly what you need."
          searchParamsKey="q"
          // disabled={true}
          filterOptions={[
            {
              key: "type",
              label: "Type",
              values: [
                { value: "article", label: "Articles" },
                { value: "experience", label: "Experiences" },
                { value: "misc", label: "Miscellaneous" },
              ],
            },
            {
              key: "category",
              label: "Category",
              values: [
                { value: "all", label: "All Categories" },
                { value: "open-source", label: "Open Source" },
                { value: "career", label: "Career Development" },
                { value: "case-study", label: "Case Studies" },
              ],
            },
            {
              key: "tags",
              label: "Tags",
              values: [
                { value: "all", label: "All Tags" },
                { value: "web-development", label: "Web Development" },
                { value: "design", label: "Design" },
                { value: "ux-ui", label: "UX/UI Design" },
              ],
            },
          ]}
        />
        <ButtonLink
          href={`https://github.com/${appConfig.githubUri}/new/main/apps/platform/resources?filename=example.mdx`}
          target="_blank"
          rel="noopener noreferrer"
          variant="rainbow_outline"
          rounded="full"
          size="sm"
          aria-label={`Write your resources`}
        >
          <Plus />
          Write Your Resources
          <ArrowUpRight />
        </ButtonLink>
        <ButtonLink
          href={`${appConfig.url}/resources/rss.xml`}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          rounded="full"
          size="sm"
          aria-label="Subscribe to RSS Feed"
        >
          <RssIcon />
          Rss Feed
          <ArrowUpRight />
        </ButtonLink>
      </BaseHeroSection>
      <div className="max-w-(--max-app-width) mx-auto px-4 lg:px-6 mb-8">
      
        <CategoryFilter categories={allCategories} />
      </div>
      <ResourcesList resources={resources} />
    </>
  );
}
