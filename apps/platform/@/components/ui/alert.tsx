import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        default_light:
          "border-primary/50 text-primary dark:border-primary [&>svg]:text-primary bg-primary/10 dark:bg-primary/10",
        success:
          "border-green-500/50 text-green-500 dark:border-green-500 [&>svg]:text-green-500 bg-green-500/10 dark:bg-green-500/10",
        info: "border-blue-500/50 text-blue-500 dark:border-blue-500 [&>svg]:text-blue-500 bg-blue-500/10 dark:bg-blue-500/10",
        info_light:
          "border-none text-blue-500 dark:border-none [&>svg]:text-blue-500 bg-blue-500/10 dark:bg-blue-500/10",
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
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }

