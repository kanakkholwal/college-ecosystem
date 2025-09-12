"use client";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import GDiscus from "@giscus/react";
import { AnimatePresence, motion } from "framer-motion";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
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
const depthClass = {
  1: "pl-0 font-medium",
  2: "pl-4",
  3: "pl-8 text-sm",
  4: "pl-12 text-sm",
  5: "pl-16 text-xs",
  6: "pl-20 text-xs",
};
export const TableOfContents = ({ items, className = "" }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleObserver: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveId(entry.target.id);
      });
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: "-40% 0px -40% 0px",
      threshold: [0, 0.25, 0.5, 1],
    });

    items.forEach((item) => {
      const element = document.getElementById(item.href.slice(1));
      if (element) observer.current?.observe(element);
    });

    return () => observer.current?.disconnect();
  }, [items]);

  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const target = document.getElementById(href.slice(1));
    if (target) {
      window.history.replaceState(null, "", href);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };



  return (
    <motion.div
      className={cn(
        "sticky top-[4.5rem] max-h-[80vh] flex flex-col bg-inherit",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toggle */}
      <button
        className="flex items-center gap-2 mb-3 w-full text-sm bg-muted py-1.5 px-3 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Collapse" : "Expand"}
      >
        <Icon name="toc" className="size-4" />
        Table of Contents
        <span className="ml-auto">
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </span>
      </button>

      {/* List */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-y-auto pr-2 no-scrollbar flex-1"
          >
            <ul className="space-y-1 border-l">
              {items.map((item, idx) => {
                const id = item.href.slice(1);
                const isActive = activeId === id;

                return (
                  <motion.li
                    key={id}
                    className={cn("relative", depthClass[item.depth])}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => handleClick(e, item.href)}
                      className={cn(
                        "block py-1 pr-3 transition-all duration-200 text-sm",
                        isActive ? "text-primary font-medium" : "text-muted-foreground"
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="toc-active-indicator"
                          className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-full"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      {item.value}
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function CommentSection() {
  const { resolvedTheme } = useTheme();
  const gDiscusTheme = resolvedTheme !== "light" ? "dark_protanopia" : "light";
  return (
    <div className="comment-section w-full flex-auto">
      <GDiscus
        id="comments"
        repo="kanakkholwal/college-ecosystem"
        repoId="R_kgDOMKgxsg"
        // category="Announcements"
        // data-category-id="[ENTER CATEGORY ID HERE]"
        // categoryId="DIC_kwDOF1L2fM4B-hVS"
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
  );
}
