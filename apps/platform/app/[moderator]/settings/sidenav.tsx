"use client";

import { buttonVariants } from "@/components/ui/button"; // Assuming shadcn button
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const isActive = pathname.includes(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "relative justify-start hover:bg-transparent hover:text-foreground h-10 px-4",
              isActive
                ? "font-semibold text-primary"
                : "text-muted-foreground font-medium"
            )}
          >
            {/* Active State Background Animation */}
            {isActive && (
              <motion.div
                layoutId="sidebarActive"
                className="absolute inset-0 rounded-md bg-muted"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            {/* Content Layer */}
            <span className="relative z-10 flex items-center gap-2">
               {Icon && <Icon className="size-4" />}
               {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}