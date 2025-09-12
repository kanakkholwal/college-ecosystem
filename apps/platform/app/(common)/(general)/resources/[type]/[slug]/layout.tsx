"use client";
import { mdxComponents } from "@/markdown/mdx-components";
import { MDXProvider } from "@mdx-js/react";

export default function ResourceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MDXProvider components={mdxComponents}>{children}</MDXProvider>;
}
