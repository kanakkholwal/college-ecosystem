"use client";
import * as React from "react";

import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const inputVariants = cva(
  "flex h-10 w-full rounded-md  bg-background px-3 py-2 text-sm font-medium  file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 disabled:border-slate-100 invalid:ring-red-500",
  {
    variants: {
      variant: {
        default: "border border-input focus:border-primary border-solid",
        outline: "border border-input",
        ghost:
          "border border-solid border-transparent bg-gray-200/40 dark:bg-gray-800 text-gray-900 dark:text-gray-200 dark:border-gray-700  focus:border-primary/70 dark:focus:border-primary/70",
        fluid:
          "border border-solid border-transparent bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 dark:border-slate-700  focus:border-primary/70 dark:focus:border-primary/70",
        border: "border-2 focus:border-primary/70 border-solid",
        glass:
          "bg-white/75 dark:bg-white/5 backdrop-blur-lg border border-slate-500/10 dark:border-border/70 focus:border-primary/70",
      },
      rounded: {
        default: "rounded-md",
        sm: "rounded-sm",
        lg: "rounded-3xl",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      rounded: "default",
    },
  }
);
export interface InputProps
  // HTMLInputElement,
  //   React.ComponentProps<"input">,
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, rounded, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className, rounded }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
