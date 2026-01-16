import matter from "gray-matter";
import { type MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { highlight } from "remark-sugar-high";
import { unified } from "unified";

import remarkFlexibleToc, { TocItem } from "remark-flexible-toc";

/**
 * Compile MDX content into a serializable format
 * @param content - The MDX content as a string
 * @returns A promise that resolves to the serialized MDX content
 */

export const compileMdxSource = async (
  content: string
): Promise<MDXRemoteSerializeResult> => {
  try {
    // Serialize the MDX content with frontmatter parsing
    const mdxSource = await serialize(content, {
      parseFrontmatter: true, // Enable frontmatter parsing
      mdxOptions: {
        // You can add any additional MDX options here if needed
        remarkPlugins: [remarkGfm, highlight], // Enable GitHub Flavored Markdown
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            { behavior: "wrap", test: ["h2", "h3", "h4"] },
          ],
          // rehypeMermaid
        ], // Add any rehype plugins if needed
      },
      scope: {
        toc: [] as TocItem[], // Initialize toc as an empty array
      }, // You can pass any additional scope variables here
    });
    const toc = await getTocFromMDX(content);
    // Add the generated TOC to the scope
    mdxSource.scope.toc = toc;
    return mdxSource;
  } catch (error) {
    console.warn("Error compiling MDX:", error);
    return Promise.reject({
      name: "Failed to compile MDX content",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      error: error instanceof Error ? error.message : String(error),
    } as Error);
  }
};



/**
 * Extract Table of Contents from MDX content
 * @param content - The MDX content as a string
 * @returns A promise that resolves to the Table of Contents items
 * This function uses remark-flexible-toc to parse the headings and generate a structured TOC.
 */
async function getTocFromMDX(content: string): Promise<TocItem[]> {
  try {
    const { content: mdxContentWithoutFrontmatter } = matter(content);
    const file = await unified()
      .use(remarkFlexibleToc, {
        tocName: "toc",
        maxDepth: 6,
        skipLevels: [1],
        skipParents: ["blockquote"],
      }) // Add TOC generation
      .use(remarkParse) // Convert into markdown AST
      .use(remarkRehype) // Transform to HTML AST
      .use(rehypeStringify) // Convert AST into serialized HTML
      .process(mdxContentWithoutFrontmatter); // Process the content without frontmatter

    return file.data.toc as TocItem[];
  } catch (error) {
    console.log("Error processing MDX for Table of Contents:", error);
    return [];
  }
}