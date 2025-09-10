"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-1 space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 relative",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const isActive = pathname.includes(item.href);

        return (
          <motion.div
            key={item.href}
            whileHover={{ scale: 1.03, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Link
              href={item.href}
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.title}
            </Link>

            {isActive && (
              <motion.div
                layoutId="sidebarActive"
                className="absolute inset-0 rounded-md bg-primary/10"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </motion.div>
        );
      })}
    </nav>
  );
}
