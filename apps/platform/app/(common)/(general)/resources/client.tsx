"use client";
import ResourceCard from "@/components/application/resource-card";
import { ResponsiveContainer } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { ResourceFrontMatter } from "~/lib/markdown/mdx";

export function CategoryFilter({ categories }: { categories: string[] }) {
  const [category, setCategory] = useQueryState(
    "type",
    parseAsStringEnum(categories)
  );
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {["", ...categories].map((cat, index) => (
        <Button
          key={`category-${index}`}
          variant={category === cat ? "default_soft" : "outline"}
          onClick={() => setCategory(cat)}
          rounded="full"
          size="sm"
        >
          {cat || "All Resources"}
        </Button>
      ))}
    </div>
  );
}

export function ResourcesList({
  resources,
  className,
  showImage,
}: {
  resources: ResourceFrontMatter[];
  className?: string;
  showImage?: boolean;
}) {
  const [category, _] = useQueryState(
    "category",
    parseAsStringEnum(resources.map((r) => r.category || ""))
  );
  const [searchQuery, __] = useQueryState("q", {
    throttleMs: 500, // Debounce typing
    defaultValue: "",
  });
  const [tag] = useQueryState("tag");
  const [type] = useQueryState(
    "type",
    parseAsStringEnum(resources.map((r) => r.type || ""))
  );
  const [results, setResults] = useState<ResourceFrontMatter[]>([]);

  // Memoized Fuse.js instance
  const fuse = useMemo(() => {
    return new Fuse(resources, {
      keys: ["title", "summary", "content", "tags", "type"],
      includeMatches: true,
      minMatchCharLength: 2,
      threshold: 0.4,
      isCaseSensitive: false,
      shouldSort: true,
      useExtendedSearch: true,
      distance: 100,
      ignoreLocation: true,
    });
  }, [resources]);
  useEffect(() => {
    let filteredResources: ResourceFrontMatter[] = [];
    if (searchQuery && searchQuery.trim().length > 2) {
      const searchResults = fuse.search(searchQuery);
      if (searchResults.length > 0) {
        filteredResources = searchResults.map((result) => result.item);
      } else {
        setResults([]);
      }
    } else {
      filteredResources = resources;
    }
    if (category && category.trim() !== "") {
      filteredResources = filteredResources.filter(
        (resource) =>
          resource.category?.toLowerCase() === category.toLowerCase()
      );
    }
    if (tag && tag.trim() !== "") {
      filteredResources = filteredResources.filter(
        (resource) =>
          Array.isArray(resource.tags) && resource.tags.includes(tag)
      );
    }
    if (type && type.trim() !== "") {
      filteredResources = filteredResources.filter(
        (resource) => resource.type?.toLowerCase() === type.toLowerCase()
      );
    }
    setResults(filteredResources);
  }, [searchQuery, fuse, resources, category, tag, type]);

  return (
    <ResponsiveContainer
      className={cn(
        "px-3 pr-4 lg:px-6 @md:grid-cols-1 @5xl:grid-cols-3",
        className
      )}
      role="list"
      aria-label="List of resources"
    >
      {results.map((frontmatter) => (
        <div key={frontmatter.slug} role="listitem">
          <ResourceCard
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
            showImage={showImage}
          />
        </div>
      ))}
    </ResponsiveContainer>
  );
}
