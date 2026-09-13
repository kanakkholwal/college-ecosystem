"use client";

import { cn } from "@/lib/utils";
import { sendGAEvent } from "@next/third-parties/google";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { twUtility } from "../utils/tailwind-classes";

type NavLinkItems = {
  title: string;
  href: string;
  description: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
};

interface NavLink extends LinkProps {
  id: string;
  children: React.ReactNode;
  href: string;
  notification?: string | React.ReactNode | number;
  items?: NavLinkItems[];
  isNew?: boolean;
}

interface NavTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  navLinks: NavLink[];
  activeTab?: string;
  triggerHeight?: string;
}
// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

// const itemVariants: Variants = {
//   hidden: { opacity: 0, y: 8 },
//   show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 24 } },
//   exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
// };
const NavTabs = React.forwardRef<HTMLDivElement, NavTabsProps>(
  (
    { className, navLinks, activeTab, triggerHeight = "h-9", ...props },
    ref
  ) => {
    const pathname = usePathname();
    const defaultIndex = navLinks.findIndex((link) =>
      pathname.startsWith(link.href)
    );

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(
      navLinks.length
    );
    const [activeIndex, setActiveIndex] = useState<number>(defaultIndex);
    const [hoverStyle, setHoverStyle] = useState<{
      left?: string;
      width?: string;
    }>({});
    const [activeStyle, setActiveStyle] = useState({
      left: "0px",
      width: "0px",
    });
    const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    useEffect(() => {
      if (hoveredIndex !== null) {
        const hoveredElement = tabRefs.current[hoveredIndex];
        if (hoveredElement) {
          const { offsetLeft, offsetWidth } = hoveredElement;
          setHoverStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          });
        }
      }
    }, [hoveredIndex]);

    useEffect(() => {
      const activeElement = tabRefs.current[activeIndex];
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }, [activeIndex]);

    useEffect(() => {
      requestAnimationFrame(() => {
        const firstElement = tabRefs.current[activeIndex];
        if (firstElement) {
          const { offsetLeft, offsetWidth } = firstElement;
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          });
        }
      });
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 max-w-(--max-app-width)",
          twUtility.horizontalScroll,
          "mx-2 lg:mx-4",
          className,
          "relative"
        )}
        {...props}
      >
        <div
          className={cn(
            "absolute flex items-center rounded-md bg-muted transition-all duration-300 ease-craft",
            triggerHeight
          )}
          style={{
            ...hoverStyle,
            opacity: hoveredIndex !== null ? 1 : 0,
          }}
        />
        {/* Active Indicator */}
        <div
          className="absolute bottom-0 z-10 h-0.5 rounded-full bg-primary transition-all duration-300 ease-craft"
          style={activeStyle}
        />{" "}
        {/* Tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="inline-flex items-center gap-1"
          >
            {navLinks.map((navLink, index) => (
              <Link
                href={navLink.href}
                key={navLink.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                className={cn(
                  "px-3 py-2 cursor-pointer transition-colors duration-300 z-10 ",
                  "font-medium bg-transparent text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring rounded-md",
                  activeIndex === index
                    ? "text-foreground [&_svg]:text-primary"
                    : "",
                  hoveredIndex === index ? "text-foreground" : "",
                  triggerHeight
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  setActiveIndex(index);
                  // onTabChange?.(navLink.id)
                  sendGAEvent("event", "nav_link_click", {
                    href: navLink.href,
                    id: navLink.id,
                    hasChildren: !!navLink.items?.length,
                  });
                }}
              >
                <div className="flex h-full items-center justify-center gap-2 whitespace-nowrap text-body [&>svg]:size-4 [&>svg]:duration-500 hover:[&>svg]:rotate-y-180">
                  {navLink?.children}
                  {navLink.notification ? (
                    <span className="inline-flex size-4 items-center justify-center rounded-full bg-primary/10 text-caption font-medium text-primary">
                      {navLink.notification}
                    </span>
                  ) : null}
                  {navLink?.isNew ? (
                    <span className="inline-flex items-center justify-center rounded-full border border-border px-1.5 text-caption font-medium text-primary">
                      New
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
        {/* <AnimatePresence>
                    {(hoveredIndex !== null && navLinks[hoveredIndex]?.items) && (
                        <motion.div
                            style={{
                                left: hoverStyle?.left,
                                top: "calc(100% + 10px)",
                            }}
                            className="absolute z-50 w-96 rounded-lg border bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 p-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {navLinks[hoveredIndex]?.items?.map((item) => (
                                <Link
                                    href={item.href}
                                    key={item.href}
                                    className={cn(
                                        "block px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50",
                                        "bg-transparent"
                                    )}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence> */}
      </div>
    );
  }
);
NavTabs.displayName = "NavTabs";

export { NavTabs };
