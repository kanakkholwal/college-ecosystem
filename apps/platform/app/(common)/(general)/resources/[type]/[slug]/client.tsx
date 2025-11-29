"use client";

import { cn } from "@/lib/utils";
import GDiscus from "@giscus/react";
import { motion } from "framer-motion";
import { ListCollapse, MessageSquare } from "lucide-react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { TocItem } from "remark-flexible-toc";

export function ClientMdx({
  mdxSource,
}: {
  mdxSource: MDXRemoteSerializeResult;
}) {
  return <MDXRemote {...mdxSource} />;
}


interface TableOfContentsProps {
  items: TocItem[];
  className?: string;
}

export const TableOfContents = ({ items, className = "" }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Filter out H1 (depth 1) usually title, start from H2
  const filteredItems = items.filter((item) => item.depth > 1 && item.depth < 5);

  useEffect(() => {
    const handleObserver: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: "-10% 0px -80% 0px", // Trigger when element is near top
      threshold: 0,
    });

    filteredItems.forEach((item) => {
      const element = document.getElementById(item.href.slice(1));
      if (element) observer.current?.observe(element);
    });

    return () => observer.current?.disconnect();
  }, [filteredItems]);

  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const target = document.getElementById(href.slice(1));
    if (target) {
      // Offset for sticky header
      const headerOffset = 100;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      
      // Update URL without jump
      window.history.pushState(null, "", href);
      setActiveId(href.slice(1));
    }
  };

  if (filteredItems.length === 0) return null;

  return (
    <nav className={cn("flex flex-col space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
        <ListCollapse className="size-4" />
        <span>On this page</span>
      </div>
      
      <div className="relative pl-0.5">
        {/* The Track Line */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border/60" />

        <ul className="flex flex-col text-sm">
          {filteredItems.map((item) => {
            const id = item.href.slice(1);
            const isActive = activeId === id;
            
            // Dynamic indentation based on depth
            const indent = item.depth === 2 ? "pl-4" : item.depth === 3 ? "pl-7" : "pl-10";

            return (
              <li key={id} className="relative">
                {isActive && (
                  <motion.div
                    layoutId="toc-indicator"
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className={cn(
                    "block py-1.5 pr-2 transition-colors duration-200 line-clamp-1 hover:text-foreground",
                    indent,
                    isActive 
                        ? "text-primary font-medium" 
                        : "text-muted-foreground/80"
                  )}
                >
                  {item.value}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};


export function CommentSection() {
  const { resolvedTheme } = useTheme();
  // Map next-themes to giscus themes
  const gDiscusTheme = resolvedTheme === "dark" ? "transparent_dark" : "light";

  return (
    <div className="mt-12 w-full border-t border-border/50 pt-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
            <MessageSquare className="size-5" />
        </div>
        <div>
            <h3 className="text-lg font-semibold tracking-tight">Discussion</h3>
            <p className="text-sm text-muted-foreground">Join the conversation via GitHub</p>
        </div>
      </div>

      <div className="min-h-[200px] rounded-xl bg-background/50">
        <GDiscus
          id="comments"
          repo="kanakkholwal/college-ecosystem"
          repoId="R_kgDOMKgxsg"
          mapping="pathname"
          term="Welcome to the College Ecosystem!"
          strict="1"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={gDiscusTheme}
          lang="en"
          loading="lazy"
        />
      </div>
    </div>
  );
}