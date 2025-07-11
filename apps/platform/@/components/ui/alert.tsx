import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        default_light:
          "border-primary/50 text-primary dark:border-primary [&>svg]:text-primary bg-primary/10 dark:bg-primary/10",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/10 dark:bg-destructive/10",
        success:
          "border-green-500/50 text-green-500 dark:border-green-500 [&>svg]:text-green-500 bg-green-500/10 dark:bg-green-500/10",
        info: "border-blue-500/50 text-blue-500 dark:border-blue-500 [&>svg]:text-blue-500 bg-blue-500/10 dark:bg-blue-500/10",
        info_light: "border-none text-blue-500 dark:border-none [&>svg]:text-blue-500 bg-blue-500/10 dark:bg-blue-500/10",
        warning:
          "border-yellow-500/50 text-yellow-500 dark:border-yellow-500 [&>svg]:text-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/10",
        emerald:
          "border-emerald-500/50 text-emerald-500 dark:border-emerald-500 [&>svg]:text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10",
        neutral:
          "border-gray-500/50 text-gray-500 dark:border-gray-500 [&>svg]:text-gray-500 bg-gray-500/10 dark:bg-gray-500/10",
      },

    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-normal tracking-tight ", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
