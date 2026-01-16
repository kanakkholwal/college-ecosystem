import fs from "fs";
import matter from "gray-matter";
import { type MDXRemoteSerializeResult } from "next-mdx-remote";
import path from "path";
import { calculateReadingTime } from "~/utils/string";

import { compileMdxSource } from "@/markdown/utils";
import { TocItem } from "remark-flexible-toc";

export const resourcesTypes = [
  "guides",
  "articles",
  "experiences",
  "misc",
] as const;
/**
 * Resource types corresponding to folders under /resources
 */
export type ResourceType = (typeof resourcesTypes)[number];

/**
 * Expected frontmatter schema for resource MDX files
 */
export interface ResourceFrontMatter {
  title: string;
  slug: string;
  type: ResourceType; // 'articles' | 'experiences' | 'misc'
  date: string; // ISO date string
  updated?: string; // ISO date string, optional
  author?: {
    name: string;
    url: string;
    image?: string;
    handle?: string;
    handleUrl?: string; // Optional URL for the author's handle
    username?: string; // Optional username for the author corresponding to platform
  };
  tags?: string[];
  summary?: string;
  coverImage?: string;
  readingTime?: string;
  published?: boolean;
  category?: string;
  featured?: boolean;
  draft?: boolean;
  alternate_reads?: string[]; // Array of URLs for alternate reads
}

export type CompliedResource = {
  mdxSource: MDXRemoteSerializeResult;
  frontmatter: ResourceFrontMatter;
  data: { toc: TocItem[] };
};




const RESOURCE_DIR = path.join(process.cwd(), "resources");

/**
 * Verify that the given resource type is supported
 */
function assertResourceType(type: string): asserts type is ResourceType {
  if (!resourcesTypes.includes(type as ResourceType)) {
    throw new Error(`Unsupported resource type: ${type}`);
  }
}

/**
 * Get all filenames under a resource type directory (.md or .mdx)
 */
export function getMDXFiles(type: ResourceType): string[] {
  const dirPath = path.join(RESOURCE_DIR, type);
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Resource directory not found: ${dirPath}`);
  }
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

/**
 * Read a single MDX file by type and slug
 */
export async function getMDXBySlug(
  type: ResourceType,
  slug: string
): Promise<CompliedResource> {
  assertResourceType(type);
  const filename = `${slug}.mdx`;
  const filePathMd = path.join(RESOURCE_DIR, type, filename);
  const filePathMdExt = filePathMd.replace(/\.mdx$/, ".md");

  let fullPath: string;
  if (fs.existsSync(filePathMd)) {
    fullPath = filePathMd;
  } else if (fs.existsSync(filePathMdExt)) {
    fullPath = filePathMdExt;
  } else {
    throw new Error(`MDX file not found for slug: ${slug} in ${type}`);
  }

  const source = fs.readFileSync(fullPath, "utf-8");
  const mdxSource = await compileMdxSource(source);
  const frontmatter = matter(source);
  // Validate required frontmatter fields
  // console.log('Frontmatter:', frontmatter.data);
  frontmatter.data.readingTime = calculateReadingTime(source || "");
  frontmatter.data.type = type;

  return {
    mdxSource,
    data: {
      toc: (mdxSource.scope.toc || []) as TocItem[],
    },
    frontmatter: frontmatter.data as ResourceFrontMatter,
  };
}

/**
 * Get frontmatter metadata for all resources of a type, sorted by date desc
 */
export async function getAllMDXMeta(
  type: ResourceType
): Promise<ResourceFrontMatter[]> {
  assertResourceType(type);
  const files = getMDXFiles(type);
  const meta = await Promise.all(
    files.map(async (filename) => {
      const slug = filename.replace(/\.mdx?$/, "");
      const { frontmatter } = await getMDXBySlug(type, slug);
      frontmatter.type = type; // Add type to frontmatter
      return frontmatter;
    })
  );

  return meta
    .filter((item) => item?.published !== false && item?.draft !== true) // Filter out unpublished or draft items
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get all available resource types
 */
export function getResourceTypes(): ResourceType[] {
  return fs.readdirSync(RESOURCE_DIR).filter((dir) => {
    const full = path.join(RESOURCE_DIR, dir);
    if (!fs.statSync(full).isDirectory()) return false;
    const files = fs
      .readdirSync(full)
      .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
    return files.length > 0;
  }) as ResourceType[];
}

/**
 * Generate parameters for static paths in Next.js using all types & slugs
 */
export function getAllResourcePaths(): Array<{
  params: { type: ResourceType; slug: string };
}> {
  const types = getResourceTypes();
  const paths: Array<{ params: { type: ResourceType; slug: string } }> = [];

  types.forEach((type) => {
    getMDXFiles(type).forEach(async (fn) => {
      const slug = fn.replace(/\.mdx?$/, "");
      const { frontmatter } = await getMDXBySlug(type, slug);
      if (frontmatter.published !== false) {
        paths.push({ params: { type, slug } });
      }
    });
  });

  return paths;
}

/**
 * Filter resources by tag
 */
export async function getResourcesByTag(
  type: ResourceType,
  tag: string
): Promise<ResourceFrontMatter[]> {
  const allResources = await getAllMDXMeta(type);
  return allResources.filter(
    (r) => Array.isArray(r.tags) && r.tags.includes(tag)
  );
}

/**
 * Get featured resources of a type
 */
export async function getFeaturedResources(
  type: ResourceType
): Promise<ResourceFrontMatter[]> {
  return (await getAllMDXMeta(type)).filter((r) => r.featured === true);
}

/**
 * Get resources by category
 */
export async function getResourcesByCategory(
  type: ResourceType,
  category: string
): Promise<ResourceFrontMatter[]> {
  const allResources = await getAllMDXMeta(type);
  return allResources.filter((r) => r.category === category);
}

/**
 * Get recent N resources
 */
export async function getRecentResources(
  type: ResourceType,
  count: number
): Promise<ResourceFrontMatter[]> {
  const allResources = await getAllMDXMeta(type);
  return allResources.slice(0, count);
}

export async function getAllResources(
  limit?: number
): Promise<ResourceFrontMatter[]> {
  const types = getResourceTypes();
  const allResources: ResourceFrontMatter[] = [];
  for await (const type of types) {
    allResources.push(...(await getAllMDXMeta(type)));
  }
  if (limit) {
    return allResources.slice(0, limit);
  }
  return allResources;
}

export async function getAllResourcesGroupedByType(): Promise<
  Record<ResourceType, ResourceFrontMatter[]>
> {
  const types = getResourceTypes();
  const grouped: Record<ResourceType, ResourceFrontMatter[]> = {} as Record<
    ResourceType,
    ResourceFrontMatter[]
  >;
  for (const type of types) {
    grouped[type] = await getAllMDXMeta(type);
  }
  return grouped;
}

export async function getResourceBySlug(
  type: ResourceType,
  slug: string
): Promise<CompliedResource | null> {
  try {
    const response = await getMDXBySlug(type, slug);
    return response;
  } catch (e) {
    return null; // Return null if not found
  }
}
export async function getResourceRelated(
  slug: string
): Promise<ResourceFrontMatter[]> {
  try {
    const response = await getAllResources();
    return response.filter((resource) => resource.slug !== slug);
  } catch (e) {
    return []; // Return empty array if not found
  }
}

/**
 * API for resource management
 * Provides methods to fetch resources, MDX content, and metadata
 */
export const resourceApi = {
  getResourceBySlug,
  getMDXBySlug,
  getAllMDXMeta,
  getAllResources,
  getAllResourcesGroupedByType,
  getResourceTypes,
  getMDXFiles,
  getResourcesByTag,
  getFeaturedResources,
  getResourcesByCategory,
  getRecentResources,
  getAllResourcePaths,
} as const;
