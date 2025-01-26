"use client";

import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full gap-2 px-2.5 py-0.5  capitalize whitespace-nowrap font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground hover:bg-primary/80",
        default_light:
          "border-primary/10 bg-primary/10 text-primary hover:bg-primary/20 dark:backdrop-blur-sm",
        success_light: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
        warning_light:
          "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
        info_light: "bg-sky-500/10 text-sky-500 hover:bg-sky-500/20",
        info: "bg-sky-100 hover:bg-sky-200 text-sky-600 dark:bg-sky-700 dark:text-sky-200 dark:hover:bg-sky-800 dark:hover:text-sky-200",
        destructive_light:
          "bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-500",
        ghost:
          "bg-white hover:bg-white hover:text-accent-foreground  dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white",
        slate:
          "bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-950 dark:hover:text-slate-100",
        dark: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white/80 dark:hover:bg-white/70 dark:text-slate-200",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-green-100 text-green-600 border-green-400 dark:bg-green-500/20 dark:border-green-400/50",
        warning: "bg-yellow-100 text-yellow-600 border-yellow-400",
        destructive: "bg-red-100 text-red-600 border-red-400",
        gradient_blue:
          "text-white bg-linear-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-linear-to-br",
        gradient_green:
          "text-white bg-linear-to-r from-green-400 via-green-500 to-green-600 hover:bg-linear-to-br",
        gradient_cyan:
          "text-white bg-linear-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-linear-to-br",
        gradient_teal:
          "text-white bg-linear-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-linear-to-br",
        gradient_lime:
          "text-white bg-linear-to-r from-lime-400 via-lime-500 to-lime-600 hover:bg-linear-to-br",
        gradient_red:
          "text-white bg-linear-to-r from-red-400 via-red-500 to-red-600 hover:bg-linear-to-br",
        gradient_pink:
          "text-white bg-linear-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-linear-to-br",
        gradient_purple:
          "text-white bg-linear-to-r from-purple-400 via-purple-500 to-purple-600 hover:bg-linear-to-br",
        glass:
          "backdrop-blur-lg bg-white/30 dark:bg-slate-800/15 backdrop-blur-xl border-white/10 dark:border-white/5 dark:text-white shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs font-regular",
        md: "px-3 py-0.5 text-sm",
        lg: "px-4 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
