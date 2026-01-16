"use client";
import * as React from "react";

import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border border-input bg-input/30 px-3 py-2 text-sm font-medium ring-offset-background placeholder:text-muted-foreground  focus-visible:outline-none focus-visible:border-primary/80 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input",
        outline: "border border-solid bg-slate-100 dark:bg-neutral-800",
        ghost:
          "border border-solid border-transparent bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200 dark:border-slate-700 focus:border-primary/70",
        border: " border-2 focus:border-primary/70 border-solid",
        glass:
          "bg-white/75 dark:bg-white/5 backdrop-blur-lg border border-slate-500/10 dark:border-border/70 focus:border-primary/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
